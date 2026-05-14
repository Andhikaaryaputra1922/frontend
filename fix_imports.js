const fs = require('fs');
const path = require('path');

const replacements = {
  "@/components/BackButton": "@/shared/components/ui/BackButton",
  "@/components/LogoutButton": "@/shared/components/ui/LogoutButton",
  "@/components/theme-provider": "@/shared/components/ui/theme-provider",
  "@/components/ui/PremiumFeedback": "@/shared/components/ui/PremiumFeedback",
  "@/components/ui/ImageCropperModal": "@/shared/components/ui/ImageCropperModal",
  "@/components/ui/IslamicPanel": "@/shared/components/ui/IslamicPanel",
  "@/components/ui/card": "@/shared/components/ui/card",
  "@/components/WaktuOperasional": "@/shared/components/ui/WaktuOperasional",
  
  "@/components/Sidebar": "@/features/users/components/layouts/Sidebar",
  "@/components/teacher/TeacherSidebar": "@/features/users/components/layouts/TeacherSidebar",
  "@/components/student/StudentSidebar": "@/features/users/components/layouts/StudentSidebar",
  "@/components/student/StudentHeader": "@/features/users/components/layouts/StudentHeader",
  "@/components/admin/AdminSidebar": "@/features/users/components/layouts/AdminSidebar",
  
  "@/components/LandingClient": "@/features/packages/components/LandingClient",
  "@/components/enroll-button": "@/features/packages/components/enroll-button",
  "@/components/complete-enrollment-button": "@/features/packages/components/complete-enrollment-button",
  
  "@/components/StudentDashboardClient": "@/features/users/components/StudentDashboardClient",
  
  "@/components/MateriPage": "@/features/courses/components/MateriPage",
  "@/components/quiz-take": "@/features/courses/components/quiz-take",
  "@/components/assignment-submit": "@/features/courses/components/assignment-submit",
  "@/components/NewAssignmentForm": "@/features/courses/components/NewAssignmentForm",
  
  "@/lib/auth/jwt": "@/shared/lib/auth/jwt",
  "@/lib/prisma": "@/shared/lib/prisma",
  "@/lib/origin": "@/shared/lib/origin",
  "@/lib/utils": "@/shared/utils/utils"
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
    // Regex to match imports exactly without breaking sub-paths if any exist
    // But since we just want to replace exact strings, simple split/join works too
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

console.log("Migration script complete!");
