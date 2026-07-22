import { UserProfile, MatchProfile } from './types';

export interface CompatibilityResult {
  score: number;
  breakdown: {
    age: number;
    location: number;
    gender: number;
    religion: number;
    education: number;
    languages: number;
    interests: number;
    onlineStatus: number;
    baseCompatibility: number;
    interactions: number;
  };
  reasons: string[];
}

export function calculateCompatibilityScore(user: UserProfile, match: MatchProfile): CompatibilityResult {
  // 1. Age preferences (Max 10 points)
  let ageScore = 0;
  if (match.age >= user.ageRangeMin && match.age <= user.ageRangeMax) {
    ageScore = 10;
  } else {
    const diff = Math.min(Math.abs(match.age - user.ageRangeMin), Math.abs(match.age - user.ageRangeMax));
    if (diff <= 2) ageScore = 7;
    else if (diff <= 5) ageScore = 4;
  }

  // 2. Location (Max 15 points)
  let locationScore = 0;
  if (match.distance < 3) {
    locationScore = 15;
  } else if (match.distance < 6) {
    locationScore = 12;
  } else if (match.distance < 12) {
    locationScore = 8;
  } else if (match.distance <= 25) {
    locationScore = 5;
  }

  // 3. Gender preference (Max 15 points)
  let genderScore = 0;
  const matchWantsUser = true; // Assume standard compatibility
  const userWantsMatch = user.lookingFor === 'everyone' || user.lookingFor === match.gender;
  if (userWantsMatch) {
    genderScore = 15;
  }

  // 4. Religion (Max 10 points)
  let religionScore = 0;
  if (user.religion && match.religion) {
    if (user.religion.toLowerCase() === match.religion.toLowerCase()) {
      religionScore = 10;
    } else if (
      (user.religion.includes("None") && match.religion.includes("None")) ||
      (user.religion.toLowerCase().includes("spiritual") && match.religion.toLowerCase().includes("spiritual"))
    ) {
      religionScore = 8;
    } else {
      religionScore = 4; // basic tolerance
    }
  } else {
    religionScore = 6; // default fallback
  }

  // 5. Education (Max 10 points)
  let educationScore = 0;
  if (user.education && match.education) {
    if (user.education.toLowerCase() === match.education.toLowerCase()) {
      educationScore = 10;
    } else if (
      (user.education.includes("Degree") && match.education.includes("Degree")) ||
      (user.education.includes("College") && match.education.includes("College"))
    ) {
      educationScore = 8;
    } else {
      educationScore = 5;
    }
  } else {
    educationScore = 7; // default fallback
  }

  // 6. Languages (Max 10 points)
  let languagesScore = 0;
  if (user.languages && match.languages) {
    const sharedLangs = match.languages.filter(l => user.languages?.includes(l));
    if (sharedLangs.length > 0) {
      languagesScore = 10;
    } else {
      languagesScore = 3;
    }
  } else {
    languagesScore = 7; // default fallback
  }

  // 7. Interests (Max 15 points)
  let interestsScore = 0;
  const sharedInterests = match.interests.filter(i => user.interests.includes(i));
  interestsScore = Math.min(15, sharedInterests.length * 5);

  // 8. Online status (Max 5 points)
  const onlineScore = match.isOnline ? 5 : 2;

  // 9. Base Compatibility (chemistry index) (Max 5 points)
  let sumChars = 0;
  const identifier = match.name + match.id;
  for (let i = 0; i < identifier.length; i++) {
    sumChars += identifier.charCodeAt(i);
  }
  const baseCompatibilityScore = (sumChars % 4) + 2; // Stable pseudorandom 2 to 5 points

  // 10. Previous interactions (Max 5 points)
  let interactionsScore = 0;
  if (match.isFavorite) {
    interactionsScore += 3;
  }
  if (match.winkSent) {
    interactionsScore += 2;
  }

  const score = ageScore + locationScore + genderScore + religionScore + educationScore + languagesScore + interestsScore + onlineScore + baseCompatibilityScore + interactionsScore;

  // Compile specific highlights for display in UI
  const reasons: string[] = [];
  if (sharedInterests.length > 0) {
    reasons.push(`Shared interests in ${sharedInterests.slice(0, 2).join(' and ')}`);
  }
  if (user.religion && match.religion && user.religion === match.religion) {
    reasons.push(`Both identify with ${user.religion}`);
  }
  if (user.education && match.education && user.education === match.education) {
    reasons.push(`Academic alignment: ${user.education}`);
  }
  if (match.isOnline) {
    reasons.push(`Online now`);
  }
  if (match.distance <= 3) {
    reasons.push(`Just a stone's throw away (${match.distance} miles)`);
  }
  const sharedLangs = match.languages?.filter(l => user.languages?.includes(l)) || [];
  if (sharedLangs.length > 0) {
    reasons.push(`Both speak ${sharedLangs.slice(0, 2).join(' & ')}`);
  }
  if (match.winkSent) {
    reasons.push(`High chemical spark (Wink Sent)`);
  }

  return {
    score: Math.min(100, Math.max(30, score)), // Minimum 30% score to keep dating hopefuls happy!
    breakdown: {
      age: ageScore,
      location: locationScore,
      gender: genderScore,
      religion: religionScore,
      education: educationScore,
      languages: languagesScore,
      interests: interestsScore,
      onlineStatus: onlineScore,
      baseCompatibility: baseCompatibilityScore,
      interactions: interactionsScore
    },
    reasons: reasons.length > 0 ? reasons : [`Good location proximity`, `Vibe chemistry matching`]
  };
}
