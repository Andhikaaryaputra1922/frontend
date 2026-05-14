const fs = require('fs');
const path = require('path');

const replacements = {
  "@/components/student/StudentHomeClient": "@/features/users/components/student/StudentHomeClient",
  "@/components/student/StudentSettingsClient": "@/features/users/components/student/StudentSettingsClient",
  "@/components/teacher/TeacherAssignmentsServer": "@/features/users/components/teacher/TeacherAssignmentsServer",
  "@/components/teacher/TeacherAssigmentPage": "@/features/users/components/teacher/TeacherAssigmentPage",
  "@/components/ui/card": "@/shared/components/ui/card"
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
  
  // also check if "components/teacher" or "components/student" is still there
  if (content.includes("@/components/teacher/") && !content.includes("features/users/components/teacher/")) {
     content = content.replace(/@\/components\/teacher\//g, "@/features/users/components/teacher/");
     changed = true;
  }
  
  if (content.includes("@/components/student/") && !content.includes("features/users/components/student/")) {
     content = content.replace(/@\/components\/student\//g, "@/features/users/components/student/");
     changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in: ${file}`);
  }
});
