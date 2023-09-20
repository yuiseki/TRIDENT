import { useEffect, useState } from "react";

export const InitializeTridentAgent: React.FC<{
  setInitialized: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setInitialized }) => {
  const [initializeSequenceIndex, setInitializeSequenceIndex] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => {
      setInitializeSequenceIndex((index: number) => {
        if (index === 100) return index;
        return index + 1;
      });
    }, 10);
    return () => clearInterval(interval);
  }, [initializeSequenceIndex, setInitializeSequenceIndex]);

  useEffect(() => {
    if (initializeSequenceIndex === 100) {
      setTimeout(() => {
        setInitialized(true);
      }, 2000);
    }
  }, [initializeSequenceIndex, setInitialized]);
  return (
    <article className="tridentAgentArticle tridentAgentArticleInitializing">
      <section
        className="tridentAgentSectionInitialized"
        style={{
          opacity: initializeSequenceIndex / 100 - 0.1,
        }}
      />
      <section className="tridentAgentSection">
        <h3>Initializing TRIDENT Agent</h3>
        <h3>
          {Array.from(Array(initializeSequenceIndex).keys()).map((_v, i) => {
            return ".";
          })}
        </h3>
        <p></p>
      </section>
    </article>
  );
};
