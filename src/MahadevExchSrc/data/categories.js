import ContestIcon from "../components/icons/ContestIcon";
import InPlayIcon from "../components/icons/InPlayIcon";
import PlayerBattleIcon from "../components/icons/PlayerBattleIcon";
import SportsbookIcon from "../components/icons/SportsbookIcon";
import TournamentIcon from "../components/icons/TournamentIcon";
import VirtualIcon from "../components/icons/VirtualIcon";
import { BiSolidCricketBall } from "react-icons/bi";
import { BiSolidTennisBall } from "react-icons/bi";



export const categories = [
 { title:"IN-PLAY", bn:"লাইভ ম্যাচ", icon:InPlayIcon, path:"/sports/cricket/inplay" },

 { title:"SPORTSBOOK", bn:"স্পোর্টসবুক", icon:SportsbookIcon, path:"/sports/cricket/tomorrow?sportsbook" },

 { title:"HORSE RACE", bn:"হর্স রেসিং", icon:VirtualIcon, path:"/horseRacing" },

 { title:"GREYHOUND", bn:"গ্রেহাউন্ড রেস", icon:PlayerBattleIcon, path:"/greyhoundRacing" },

 { title:"CRICKET", bn:"ক্রিকেট", icon:BiSolidCricketBall, path:"/sports/cricket/tomorrow?sportsbook" },

 { title:"TENNIS", bn:"টেনিস", icon:BiSolidTennisBall, path:"/sports/tennis/tomorrow?sportsbook" },
];