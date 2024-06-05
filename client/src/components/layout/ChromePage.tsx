import Wrapper from "../Wrapper";
import FullLayout from "./FullLayout";
import { Link } from "react-router-dom";

function WrongBrowser() {
  return (
    <Wrapper>
    <FullLayout>
    <Link to="https://www.google.com/intl/ko_kr/chrome/next-steps.html?statcb=0&installdataindex=empty&defaultbrowser=0">
      <div className="relative z-10 mt-20 flex flex-col items-center justify-center">
        <div className="text-7xl">We Like</div>
        <div className ="flex flex-row items-center mt-10">
        <div className="text-7xl">Chr</div>
        <img className="ml-2 w-[130px]" src="https://pngimg.com/d/chrome_logo_PNG13.png"></img>
        <div className="ml-5 text-7xl">me</div>
        </div>
      </div>
      </Link>
    </FullLayout>
    </Wrapper>
  );
}

export default WrongBrowser;
