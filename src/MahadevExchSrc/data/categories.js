import ContestIcon from "../components/icons/ContestIcon";
import InPlayIcon from "../components/icons/InPlayIcon";
import PlayerBattleIcon from "../components/icons/PlayerBattleIcon";
import SportsbookIcon from "../components/icons/SportsbookIcon";
import TournamentIcon from "../components/icons/TournamentIcon";
import VirtualIcon from "../components/icons/VirtualIcon";

export const categories = [
 { title:"IN-PLAY", icon:InPlayIcon, path:"/sports/cricket/inplay" },
 { title:"SPORTSBOOK", icon:SportsbookIcon, path:"/sports/cricket/tomorrow?sportsbook" },
 { title:"VIRTUAL", icon:VirtualIcon, path:"/virtual" },
 { title:"PLAYER BATTLE", icon:PlayerBattleIcon, path:"/player-battle" },
 { title:"CONTEST", icon:ContestIcon, path:"/contest" },
 { title:"TOURNAMENT", icon:TournamentIcon, path:"/tournament" },
];