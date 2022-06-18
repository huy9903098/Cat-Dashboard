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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMutation } from "@apollo/client";
import { Loading } from "components/loading/loading";
import { DELETE_CAT_BREED } from "apollo/mutations/breed-mutation";
import "./DashBoardTable.scss";
import { BreedElement } from "components/dashboard/modals/breeds";
import { useState } from "react";
import BreedDialog from "../dialog/BreedDialog";

interface TableProps {
  data: BreedElement[];
  refetch: () => void;
  loading: boolean;
}

const DashBoardTable: React.FC<TableProps> = ({ data, refetch, loading }) => {
  const [deleteCatBreeds] = useMutation(DELETE_CAT_BREED, {
    onCompleted: () => {
      refetch();
    },
  });

  const [open, setOpenBreedDialog] = useState(false);
  const [currentId, setCurrentId] = useState("");

  const openEditModal = (id: string) => {
    setCurrentId(id);
    setOpenBreedDialog(true);
  };
  const closeEditModal = () => {
    setOpenBreedDialog(false);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data &&
              data.map((row: BreedElement) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  onClick={() => openEditModal(row.id)}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Typography className="truncate-description">
                      {row.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() =>
                        deleteCatBreeds({ variables: { id: row?.id } })
                      }
                    >
                      <DeleteIcon></DeleteIcon>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {loading && <Loading size={150} />}
      <BreedDialog
        open={open}
        handleClose={closeEditModal}
        breedId={currentId}
      />
    </>
  );
};

export default DashBoardTable;
