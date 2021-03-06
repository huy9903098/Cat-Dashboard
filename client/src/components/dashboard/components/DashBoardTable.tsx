import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Typography,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMutation } from "@apollo/client";
import { Loading } from "components/loading/loading";
import { DELETE_CAT_BREED } from "apollo/mutations/breed-mutation";
import "./DashBoardTable.scss";
import { BreedElement } from "components/dashboard/modals/breeds";
import { useContext, useState } from "react";
import BreedDialog from "../dialog/BreedDialog";
import { DashBoardContext, getCatVariable } from "context/DashBoardContext";

interface TableProps {
  data: BreedElement[];
  refetch: (variables: { variables: getCatVariable }) => void;
  loading: boolean;
}

interface headerFields {
  fields: string;
  label: string;
}

const DashBoardTable: React.FC<TableProps> = ({ data, refetch, loading }) => {
  const { dashboardState, updateVariables } = useContext(DashBoardContext);
  const { variables } = dashboardState;
  const [open, setOpenBreedDialog] = useState(false);
  const [currentId, setCurrentId] = useState("");

  const headerList: headerFields[] = [
    { fields: "name", label: "Name" },
    { fields: "description", label: "Description" },
    { fields: "created_at", label: "Created At" },
  ];
  const [deleteCatBreeds, { loading: deleteLoading }] = useMutation(
    DELETE_CAT_BREED,
    {
      onCompleted: () => {
        refetch({ variables });
      },
    }
  );

  const handleSort = (sortBy: string) => {
    updateVariables({
      ...variables,
      sort: sortBy,
      order: variables.order === "asc" ? "desc" : "asc",
    });
  };

  const openEditModal = (id: string) => {
    setCurrentId(id);
    setOpenBreedDialog(true);
  };
  const closeEditModal = () => {
    setOpenBreedDialog(false);
  };

  return (
    <>
      <div className="table-wrapper">
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                {headerList.map((h) => (
                  <TableCell key={h.fields} style={{ width: 200 }}>
                    <TableSortLabel
                      active={variables.sort === h.fields}
                      onClick={() => handleSort(h.fields)}
                      direction={variables.order === "asc" ? "asc" : "desc"}
                    >
                      {h.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell style={{ width: 50 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data &&
                data.map((row: BreedElement) => (
                  <TableRow key={row.id}>
                    {headerList.map((h) => (
                      <TableCell
                        key={row.id + `` + h.fields}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": {
                            cursor: "pointer",
                          },
                        }}
                        onClick={() => openEditModal(row.id)}
                      >
                        <Typography className="truncate-description">
                          {row[h.fields as keyof BreedElement]}
                        </Typography>
                      </TableCell>
                    ))}

                    <TableCell>
                      <Tooltip title="Click to delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            deleteCatBreeds({ variables: { id: row?.id } })
                          }
                        >
                          <DeleteIcon></DeleteIcon>
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        {(loading || deleteLoading) && <Loading size={150} />}
      </div>
      <BreedDialog
        open={open}
        handleClose={closeEditModal}
        breedId={currentId}
      />
    </>
  );
};

export default DashBoardTable;
