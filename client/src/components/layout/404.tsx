import Wrapper from "../Wrapper";
import FullLayout from "./FullLayout";

function WrongUrl() {
  return (
    <Wrapper>
    <FullLayout>
      <div className="text-9xl">404</div>
    </FullLayout>
    </Wrapper>
  );
}

export default WrongUrl;
