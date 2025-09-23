// services/mapService.ts

interface MapPoint {
    location: string;
    x: number;
    y: number;
}

// Levenshtein distance function to measure "difference" between location names
const levenshtein = (s1: string, s2: string): number => {
    if (s1.length < s2.length) { return levenshtein(s2, s1); }
    if (s2.length === 0) { return s1.length; }
    let previousRow = Array.from({ length: s2.length + 1 }, (_, i) => i);
    for (let i = 0; i < s1.length; i++) {
        let currentRow = [i + 1];
        for (let j = 0; j < s2.length; j++) {
            let insertions = previousRow[j + 1] + 1;
            let deletions = currentRow[j] + 1;
            let substitutions = previousRow[j] + (s1[i] !== s2[j] ? 1 : 0);
            currentRow.push(Math.min(insertions, deletions, substitutions));
        }
        previousRow = currentRow;
    }
    return previousRow[s2.length];
};

/**
 * Calculates the coordinates for a new map point based on the previous point,
 * location name similarity, and overall chapter progress.
 * @param path The existing path of the chapter.
 * @param newLocationName The name of the new location to plot.
 * @param chapterNodeCount The total number of nodes in the chapter.
 * @returns The {x, y} coordinates for the new point.
 */
export const calculateNewPoint = (path: MapPoint[], newLocationName: string, chapterNodeCount: number): { x: number, y: number } => {
    if (path.length === 0) {
        // This should be handled by the chapter start logic, but as a fallback:
        return { x: 50, y: 50 };
    }

    const lastPoint = path[path.length - 1];
    
    // 1. Calculate dissimilarity of location names
    const levDistance = levenshtein(lastPoint.location.toLowerCase(), newLocationName.toLowerCase());
    
    // 2. Calculate chapter progress
    const progressRatio = Math.min(path.length / (chapterNodeCount > 0 ? chapterNodeCount : 15), 1.0); // Avoid division by zero, assume 15 nodes if count is 0

    // 3. Determine the distance of the next step
    // A base distance, plus bonus from name difference, plus bonus from chapter progress
    const distanceMagnitude = 3 + (levDistance * 0.4) + (progressRatio * 12);

    // 4. Determine the direction
    // Mostly random direction to simulate wandering
    const randomAngle = Math.random() * 2 * Math.PI;

    let newX = lastPoint.x + Math.cos(randomAngle) * distanceMagnitude;
    let newY = lastPoint.y + Math.sin(randomAngle) * distanceMagnitude;

    // 5. Boundary checks to keep points on the map
    newX = Math.max(5, Math.min(95, newX));
    newY = Math.max(5, Math.min(95, newY));

    return { x: newX, y: newY };
};
