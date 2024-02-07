export function ReverseLookup(object, target) {
  return (
    Object.entries(object)
      .find(([_, value]) => value === target)
      ?.at(0) ?? null
  );
}
