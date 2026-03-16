const Loader = () => {
  return (
    <section className="loader-overlay">
      <div className="loader loader-1">
        <div className="loader-outter"></div>
        <div className="loader-inner"></div>
      </div>

      <style jsx>{`
        .loader-overlay {
          display: flex;
          position: fixed;
          top: 0;
          bottom: 0;
          height: 100vh;
          width: 100%;
          right: 0;
          z-index: 999999999;
          background: #160f1c82;
          justify-content: center;
          align-items: center;
        }

        .loader {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: inline-block;
        }

        .loader-1 .loader-outter {
          position: absolute;
          border: 4px solid #fff;
          border-left-color: transparent;
          border-bottom: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: loaderOutter 1s cubic-bezier(.42,.61,.58,.41) infinite;
        }

        .loader-1 .loader-inner {
          position: absolute;
          border: 4px solid #fff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          left: calc(50% - 20px);
          top: calc(50% - 20px);
          border-right: 0;
          border-top-color: transparent;
          animation: loaderInner 1s cubic-bezier(.42,.61,.58,.41) infinite;
        }

        @keyframes loaderOutter {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes loaderInner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
      `}</style>
    </section>
  );
};

export default Loader;