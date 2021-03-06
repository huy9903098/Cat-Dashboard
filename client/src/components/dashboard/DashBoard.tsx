import DashBoardTable from "./components/DashBoardTable";
import { Button, IconButton, Tooltip } from "@mui/material";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";

import "./DashBoard.scss";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_CAT_BREEDS } from "apollo/queries/breed-query";
import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import { FETCH_CAT_BREEDS } from "apollo/mutations/breed-mutation";
import BreedDialog from "./dialog/BreedDialog";
import { DashBoardContext } from "context/DashBoardContext";

const DashBoard = () => {
  const [search, setSearch] = useState<string>("");
  const [open, setOpenBreedDialog] = useState(false);

  const { dashboardState, updateList, updateVariables } =
    useContext(DashBoardContext);
  const { displayList, variables } = dashboardState;
  const [fetchCatBreeds, { loading: loadingFetch, data: dataFetch }] =
    useMutation(FETCH_CAT_BREEDS);
  const [getCatBreeds, { loading, error, data }] = useLazyQuery(
    GET_CAT_BREEDS,
    {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        updateList(data.getCatBreeds.catData);
      },
    }
  );

  const getPageNumber: string = useMemo(() => {
    const startPage = 1 + (variables.page - 1) * variables.limit;
    let endPage = variables.page * variables.limit;
    if (displayList.length < variables.limit)
      endPage -= variables.limit - displayList.length;
    return `${startPage} - ${endPage}`;
  }, [variables, displayList]);

  useEffect(() => {
    getCatBreeds({ variables });
  }, []);

  useEffect(() => {
    getCatBreeds({ variables });
  }, [variables]);

  useEffect(() => {
    if (!dataFetch) return;
    updateVariables({
      ...variables,
      page: 1,
    });
  }, [dataFetch]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateVariables({
      ...variables,
      page: 1,
      search,
    });
  };

  const handlePrevPage = () => {
    if (variables.page < 2) return;
    updateVariables({
      ...variables,
      page: variables.page - 1,
    });
  };

  const handleNextPage = () => {
    if (!data?.getCatBreeds?.hasMoreItems) return;
    updateVariables({
      ...variables,
      page: variables.page + 1,
    });
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
            <Tooltip title="Click to search">
              <Button variant="contained" type="submit">
                <SearchIcon></SearchIcon>
              </Button>
            </Tooltip>
          </form>
          <Tooltip title="Add new Cat Breed">
            <Button
              className="table-utils__control__add"
              variant="contained"
              onClick={() => setOpenBreedDialog(true)}
            >
              Add New
            </Button>
          </Tooltip>
        </div>
        <div className="table-utils__pagination">
          <Tooltip title="Refetch data from cat API">
            <Button variant="contained" onClick={() => fetchCatBreeds()}>
              <RefreshIcon></RefreshIcon>
            </Button>
          </Tooltip>
          <div>{getPageNumber}</div>
          <IconButton size="small" disabled={loading} onClick={handlePrevPage}>
            <ArrowBackIosNewOutlinedIcon></ArrowBackIosNewOutlinedIcon>
          </IconButton>
          <IconButton size="small" disabled={loading} onClick={handleNextPage}>
            <ArrowForwardIosOutlinedIcon></ArrowForwardIosOutlinedIcon>
          </IconButton>
        </div>
      </div>
      <DashBoardTable
        loading={loading || loadingFetch}
        data={displayList}
        refetch={getCatBreeds}
      ></DashBoardTable>
      <BreedDialog open={open} handleClose={() => setOpenBreedDialog(false)} />
    </>
  );
};

export default DashBoard;
