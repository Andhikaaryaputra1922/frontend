const fs = require('fs');
const path = require('path');

const replacements = {
  "@/components/management/assignment-grading": "@/features/courses/components/management/assignment-grading",
  "@/components/management/quiz-builder": "@/features/courses/components/management/quiz-builder",
  "@/components/management/quizzes-list": "@/features/courses/components/management/quizzes-list"
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  for (const [oldPath, newPath] of Object.entries(replacements)) {
    if (content.includes(oldPath)) {
      content = content.split(oldPath).join(newPath);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in: ${file}`);
  }
});
