import {
  OVERPASS_AREA_ID_OFFSET,
} from "@/lib/osm/resolveAreaRelationId";
import { isContainedBy } from "@/lib/osm/areaAncestors";

// The deep layer turns a chain of areas into an intersection: things inside
// the innermost area and inside each area around it. That is right when the
// chain is right, and empty when it is not.
//
//   Area: Matsuyama City, Tokyo, Japan
//   -> area(3601543125)->.outer;  area(3604050217)->.inner;
//   -> 松山市 ∩ 東京都  ->  0
//
// Both names resolved correctly. The city is right. Only the parent is
// invented, and it takes the whole answer with it. Asked for 松山市 alone the
// same query returns 45 cafes.
//
// An outer that does not contain the inner is pointed at the inner instead,
// so the intersection becomes the inner with itself. Deleting the assignment
// would mean rewriting the statement that uses it; repointing leaves the
// query's shape untouched, which matters for a query a model wrote.

export type AncestorLookup = (relationId: number) => Promise<Set<number>>;

const AREA_ID = /area\((\d+)\)/g;

/**
 * Repoint every outer area that does not contain the innermost one.
 *
 * `relationIds` is the chain the inner layer named, smallest first, already
 * resolved. Nothing happens when the containing relations cannot be read: a
 * geocoder that is down must not start deleting filters.
 */
export const narrowToContainingAreas = async (
  query: string,
  relationIds: number[],
  ancestorsOf: AncestorLookup
): Promise<{ query: string; narrowed: number[] }> => {
  const narrowed: number[] = [];
  const [innermost, ...outers] = relationIds ?? [];
  if (!query || typeof innermost !== "number" || outers.length === 0) {
    return { query, narrowed };
  }

  const ancestors = await ancestorsOf(innermost);
  const wrong = new Set(
    outers.filter((outer) => !isContainedBy(ancestors, outer))
  );
  if (wrong.size === 0) return { query, narrowed };

  const rewritten = query.replace(AREA_ID, (whole, digits) => {
    const relationId = Number(digits) - OVERPASS_AREA_ID_OFFSET;
    if (!wrong.has(relationId)) return whole;
    narrowed.push(relationId);
    return `area(${innermost + OVERPASS_AREA_ID_OFFSET})`;
  });

  return { query: rewritten, narrowed };
};
