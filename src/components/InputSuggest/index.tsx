import { SuggestByCurrentLocation } from "./SuggestByCurrentLocation";
import { SuggestByTrend } from "./SuggestByTrend";

export const InputSuggest: React.FC<{
  onSelected?: (value: string) => void;
}> = ({ onSelected }) => {
  return (
    <div>
      <SuggestByCurrentLocation onSelected={onSelected} />
      <SuggestByTrend onSelected={onSelected} />
    </div>
  );
}