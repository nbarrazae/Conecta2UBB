// utils/categoryIcons.js
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import GroupIcon from "@mui/icons-material/Group";

export const getCategoryIcon = (categoryName) => {
  switch (categoryName?.toLowerCase()) {
    case "videojuegos":
      return <SportsEsportsIcon />;
    case "deportes":
      return <SportsSoccerIcon />;
    case "teatro":
      return <TheaterComedyIcon />;
    case "lectura":
      return <ImportContactsIcon />;
    case "otros":
      return <GroupIcon />;
    default:
      return <GroupIcon />;
  }
};
