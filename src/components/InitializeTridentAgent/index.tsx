import { useEffect, useState } from "react";

export const InitializeTridentAgent: React.FC<{
  setInitialized: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setInitialized }) => {
  const [initializeSequenceIndex, setInitializeSequenceIndex] = useState(10);
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
      }, 1000);
    }
  }, [initializeSequenceIndex, setInitialized]);
  return (
    <article className="tridentAgentArticle tridentAgentArticleInitializing">
      <section
        className="tridentAgentSectionInitializing"
        style={{
          opacity: 1 - (initializeSequenceIndex - 2) / 100,
        }}
      />
      <section
        className="tridentAgentSectionInitialized"
        style={{
          opacity: (initializeSequenceIndex - 1) / 100 - 0.5,
        }}
      />
      <section className="tridentAgentSection">
        <h3>Initializing TRIDENT Agent</h3>
        <h3>{".".repeat(Math.floor(initializeSequenceIndex / 10))}</h3>
        <p></p>
      </section>
    </article>
  );
};
