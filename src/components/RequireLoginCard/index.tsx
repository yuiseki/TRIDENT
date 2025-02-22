export const RequireLoginCard: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          backgroundColor: "white",
          height: "50vh",
          width: "50vw",
        }}
      >
        <div
          style={{
            margin: "20px",
          }}
        >
          <a
            href="/api/auth/signin"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span
              style={{
                margin: "0 10px",
              }}
            >
              ログインして地理クイズに挑戦！
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};
