import ContestIcon from "../components/icons/ContestIcon";
import InPlayIcon from "../components/icons/InPlayIcon";
import PlayerBattleIcon from "../components/icons/PlayerBattleIcon";
import SportsbookIcon from "../components/icons/SportsbookIcon";
import TournamentIcon from "../components/icons/TournamentIcon";
import VirtualIcon from "../components/icons/VirtualIcon";
import { BiSolidCricketBall } from "react-icons/bi";
import { BiSolidTennisBall } from "react-icons/bi";



export const categories = [
 { title:"IN-PLAY", icon:InPlayIcon, path:"/sports/cricket/inplay" },
 { title:"SPORTSBOOK", icon:SportsbookIcon, path:"/sports/cricket/tomorrow?sportsbook" },
 { title:"HOURSE RACE", icon:VirtualIcon, path:"/horseRacing" },
 { title:"GREYHOUND", icon:PlayerBattleIcon, path:"/greyhoundRacing" },
 { title:"CRICKET", icon:BiSolidCricketBall, path:"/sports/cricket/tomorrow?sportsbook" },
 { title:"TENNIS", icon:BiSolidTennisBall, path:"/sports/tennis/tomorrow?sportsbook" },
];