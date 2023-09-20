import { useEffect, useState } from "react";

export const InitializeTridentAgent: React.FC<{
  setInitialized: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setInitialized }) => {
  const initializingSequence = [
    "",
    ".",
    "..",
    "...",
    "....",
    ".....",
    "......",
    ".......",
    "........",
    ".........",
    "..........",
    "...........",
    "............",
    ".............",
    "..............",
    "...............",
    "................",
    ".................",
    "..................",
    "..................",
    "..................",
    "..................",
    "..................",
    "..................",
  ];
  const [initializeSequenceIndex, setInitializeSequenceIndex] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => {
      setInitializeSequenceIndex((index: number) => {
        if (index === initializingSequence.length - 1) return index;
        return index + 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [
    initializeSequenceIndex,
    initializingSequence.length,
    setInitializeSequenceIndex,
  ]);

  useEffect(() => {
    if (initializeSequenceIndex === initializingSequence.length - 1) {
      setTimeout(() => {
        setInitialized(true);
      }, 1000);
    }
  }, [initializeSequenceIndex, initializingSequence.length, setInitialized]);
  return (
    <article className="tridentAgentArticle tridentAgentArticleInitializing">
      {initializeSequenceIndex === initializingSequence.length - 1 && (
        <section className="tridentAgentSectionInitialized" />
      )}
      <section className="tridentAgentSection">
        <h3>Initializing TRIDENT Agent</h3>
        <h3>{initializingSequence[initializeSequenceIndex]}</h3>
        <p></p>
      </section>
    </article>
  );
};
