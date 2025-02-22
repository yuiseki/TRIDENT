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
            href="/api/auth/signin?callbackUrl=/q"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "40px",
                overflow: "hidden",
                marginBottom: "10px",
              }}
            >
              <img
                width={40}
                height={40}
                src="icons/icon-48x48.png"
                alt="Not signed in"
                title="Not signed in"
              />
            </div>
            <span>ログインして地理クイズに挑戦！</span>
          </a>
        </div>
      </div>
    </div>
  );
};
