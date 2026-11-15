/** 재시작 로딩 모달 안의 스피너 (index.css 의 .banter-loader) */
const LoadingSpinner = () => (
  <div className="flex flex-col items-center py-6">
    <div className="banter-loader">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="banter-loader__box"></div>
      ))}
    </div>
    <div className="mt-10 text-lg sm:text-base">이름들을 섞는 중이에요!</div>
  </div>
);

export default LoadingSpinner;
