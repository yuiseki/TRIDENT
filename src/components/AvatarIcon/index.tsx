/* eslint-disable @next/next/no-img-element */

export const AvatarIcon: React.FC<{ who: string }> = ({ who }) => {
  return (
    <div
      style={{
        marginRight: "10px",
        width: "44px",
        height: "44px",
        marginLeft: "8px",
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        backdropFilter: "blur(4px)",
        backgroundColor:
          who === "assistant" ? "rgb(0, 158, 219)" : "rgba(0, 0, 0, 0.5)",
        border:
          who === "assistant"
            ? "2px solid rgba(0, 158, 219, 0.6)"
            : "2px solid rgba(0, 0, 0, 0.1)",
        boxShadow:
          who === "assistant"
            ? "0 2px 6px 0 rgba(0, 158, 219, 0.6)"
            : "0 2px 6px 0 rgba(0, 0, 0, 0.3)",
      }}
    >
      {who === "assistant" ? (
        <img
          width={30}
          height={30}
          src="https://i.gyazo.com/d597c2b08219ea88a211cf98859d9265.png"
          alt="ai icon"
        />
      ) : (
        <img
          width={30}
          height={30}
          src="https://i.gyazo.com/8960181a3459473ada71a8718df8785b.png"
          alt="user icon"
        />
      )}
    </div>
  );
};
