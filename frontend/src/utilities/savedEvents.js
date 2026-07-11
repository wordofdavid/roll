const STORAGE_KEY = "savedEventIds";

export function getSavedEventIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function isEventSaved(eventId) {
  return getSavedEventIds().includes(eventId);
}

export function saveEvent(eventId) {
  const savedIds = getSavedEventIds();

  if (!savedIds.includes(eventId)) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...savedIds, eventId])
    );
  }
}

export function removeSavedEvent(eventId) {
  const updatedIds = getSavedEventIds().filter(
    savedId => savedId !== eventId
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIds));
}