import "./App.css";
import Button from "./component/button/Button";

function App() {
  return (
    <div className="App">
      <div className="justify-center text-9xl mb-20">WAG</div>
      <div className="flex flex-col items-center justify-center space-y-5">
        <Button size="lg" >방 생성</Button>
        <Button size="lg" >방 참가</Button>
        <Button size="lg" >랜덤 참가</Button>
        <Button size="md" >순위 보러가기</Button>
      </div>

    </div>
  );
}

export default App;
