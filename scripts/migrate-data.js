const fs = require('fs');
const path = require('path');

// Read problems.json
const problemsPath = path.join(__dirname, '..', 'public', 'problems.json');
const dsaSheetPath = path.join(__dirname, '..', 'dsa_sheet.json');

console.log('Reading problems.json...');
const problemsData = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));

console.log('Reading dsa_sheet.json...');
const dsaSheetData = JSON.parse(fs.readFileSync(dsaSheetPath, 'utf8'));

// Field name mapping
function migrateProblem(problem) {
  const migrated = {
    id: problem.id,
    name: problem.name,
    practice_link: problem.link || '', // link -> practice_link
    priority: problem.priority,
    difficulty: problem.difficulty,
    tags: problem.content?.tags || [],
    topic: problem.content?.topic || '',
    subtopic: problem.content?.subtopic || '',
    lpa_zone: mapLpaToZone(problem.lpa), // lpa -> lpa_zone
    interview_frequency: 'Medium', // Default value
    approach_tag: 'PRACTICE', // Default value
    follow_ups: problem.content?.follow_up_questions || [], // follow_up_questions -> follow_ups
    content: {
      hints: problem.content?.hints || [],
      common_mistakes: problem.content?.common_mistakes || [],
      problem_description: problem.content?.problem_description || '',
      approach_comparison: problem.content?.approach_comparison || null
    }
  };
  
  return migrated;
}

function mapLpaToZone(lpa) {
  const mapping = {
    'entry': '4-8 LPA',
    'mid': '8-12 LPA',
    'senior': '12-18 LPA'
  };
  return mapping[lpa] || '4-8 LPA';
}

function migrateSubtopic(subtopicName, subtopicData) {
  const migrated = {
    learningAid: subtopicData.learningAid || null,
    problems: subtopicData.problems.map(migrateProblem)
  };
  return migrated;
}

function migrateCategory(categoryName, categoryData) {
  const migrated = {};
  for (const [subtopicName, subtopicData] of Object.entries(categoryData)) {
    if (subtopicName === 'learningAid') continue;
    migrated[subtopicName] = migrateSubtopic(subtopicName, subtopicData);
  }
  return migrated;
}

// Perform migration
console.log('Migrating data...');
const migratedData = {
  meta: dsaSheetData.meta || {
    version: "2.0",
    total_problems: 0,
    priority_distribution: { "High": "70%", "Medium": "20%", "Low": "10%" },
    lpa_distribution: { "4-8 LPA": "30%", "8-12 LPA": "25%", "12-18 LPA": "25%", "18-25 LPA": "15%", "25+ LPA": "5%" },
    approach_tag_legend: {
      "MEMORIZE": "Learn and memorize the exact algorithm / trick — it doesn't naturally derive itself",
      "PRACTICE": "Understand the pattern and practice until intuition builds",
      "DERIVE": "Derive the solution from first principles each time — logic over memory"
    }
  }
};

// Count total problems
let totalProblems = 0;

// Migrate each category from problems.json
for (const [categoryName, categoryData] of Object.entries(problemsData)) {
  if (categoryName === 'meta') continue;
  console.log(`Migrating category: ${categoryName}`);
  migratedData[categoryName] = migrateCategory(categoryName, categoryData);
  
  // Count problems
  for (const subtopicData of Object.values(categoryData)) {
    if (subtopicData.problems) {
      totalProblems += subtopicData.problems.length;
    }
  }
}

migratedData.meta.total_problems = totalProblems;

// Write migrated data to dsa_sheet.json
console.log(`Writing migrated data to dsa_sheet.json (${totalProblems} problems)...`);
fs.writeFileSync(dsaSheetPath, JSON.stringify(migratedData, null, 2));

console.log('Migration complete!');
console.log(`Total problems migrated: ${totalProblems}`);
console.log('Please validate the migrated data before deleting problems.json');
