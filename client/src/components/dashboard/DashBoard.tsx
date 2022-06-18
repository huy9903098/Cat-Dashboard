import DashBoardTable from "./components/DashBoardTable";
import { Button, IconButton, Tooltip } from "@mui/material";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";

import "./DashBoard.scss";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_CAT_BREEDS } from "apollo/queries/breed-query";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { FETCH_CAT_BREEDS } from "apollo/mutations/breed-mutation";
import { BreedElement } from "./modals/breeds";
import BreedDialog from "./dialog/BreedDialog";

interface getCatVariable {
  page: number;
  limit: number;
  order: string;
  sort: string;
  search: string;
}

const DashBoard = () => {
  const [search, setSearch] = useState<string>("");
  const [getVariable, setVariable] = useState<getCatVariable>({
    page: 1,
    limit: 10,
    order: "desc",
    sort: "created_at",
    search: "",
  });
  const [open, setOpenBreedDialog] = useState(false);

  const [displayList, setDisplayList] = useState<BreedElement[]>([]);
  const [fetchCatBreeds, { data: dataFetch }] = useMutation(FETCH_CAT_BREEDS);
  const [getCatBreeds, { loading, error, data, refetch }] = useLazyQuery(
    GET_CAT_BREEDS,
    {
      variables: getVariable,
      fetchPolicy: "network-only",
      nextFetchPolicy: "standby",
      onCompleted: (data) => {
        setDisplayList(data.getCatBreeds.catData);
      },
    }
  );

  const getPageNumber: string = useMemo(() => {
    const startPage = 1 + (getVariable.page - 1) * getVariable.limit;
    let endPage = getVariable.page * getVariable.limit;
    if (displayList.length < getVariable.limit)
      endPage -= getVariable.limit - displayList.length;
    return `${startPage} - ${endPage}`;
  }, [getVariable, displayList]);

  useEffect(() => {
    getCatBreeds();
  }, []);

  useEffect(() => {
    const newData = {
      ...getVariable,
      page: 1,
    };
    if (getVariable.page === 1) {
      refetch(newData);
    } else {
      setVariable(newData);
    }
  }, [dataFetch]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVariable((getVariable) => ({
      ...getVariable,
      page: 1,
      search,
    }));
  };

  const handlePrevPage = () => {
    if (getVariable.page < 2) return;
    setVariable((getVariable) => ({
      ...getVariable,
      page: getVariable.page - 1,
    }));
  };

  const handleNextPage = () => {
    if (!data?.getCatBreeds?.hasMoreItems) return;
    setVariable((getVariable) => ({
      ...getVariable,
      page: getVariable.page + 1,
    }));
  };

  if (error) return <div>{error.message}</div>;

  return (
    <>
      <div className="table-utils">
        <div className="table-utils__control">
          <form
            className="table-utils__control__form"
            onSubmit={(e) => handleSearch(e)}
          >
            <input
              className="table-utils__control__search"
              placeholder="Search by text"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="contained" type="submit">
              <SearchIcon></SearchIcon>
            </Button>
          </form>

          <Button
            className="table-utils__control__add"
            variant="contained"
            onClick={() => setOpenBreedDialog(true)}
          >
            Add New
          </Button>
        </div>
        <div className="table-utils__pagination">
          <Tooltip title="Refetch data from cat API">
            <Button variant="contained" onClick={() => fetchCatBreeds()}>
              <RefreshIcon></RefreshIcon>
            </Button>
          </Tooltip>
          <div>{getPageNumber}</div>
          <IconButton size="small" onClick={handlePrevPage}>
            <ArrowBackIosNewOutlinedIcon></ArrowBackIosNewOutlinedIcon>
          </IconButton>
          <IconButton size="small" onClick={handleNextPage}>
            <ArrowForwardIosOutlinedIcon></ArrowForwardIosOutlinedIcon>
          </IconButton>
        </div>
      </div>
      <DashBoardTable
        loading={loading}
        data={displayList}
        refetch={refetch}
      ></DashBoardTable>
      <BreedDialog open={open} handleClose={() => setOpenBreedDialog(false)} />
    </>
  );
};

export default DashBoard;
