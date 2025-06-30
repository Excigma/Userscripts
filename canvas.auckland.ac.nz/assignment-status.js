const now = new Date();
const startDate = new Date(now.getTime() - (50 * 24 * 60 * 60 * 1000)); // 50 days ago
const endDate = new Date(now.getTime() + (50 * 24 * 60 * 60 * 1000)); // 50 days ahead

const formatDate = (date) => date.toISOString().split('T')[0];

fetch(`/api/v1/planner/items?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&per_page=100`, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log(`Found ${data.length} total planner items`);
  
  // Filter to show items with submissions
  const itemsWithSubmissions = data.filter(item => item.submissions);
  console.log(`Found ${itemsWithSubmissions.length} items with submissions`);
  
  // Group by course
  const itemsByCourse = itemsWithSubmissions.reduce((acc, item) => {
    const courseName = item.context_name || 'Unknown Course';
    if (!acc[courseName]) {
      acc[courseName] = [];
    }
    acc[courseName].push(item);
    return acc;
  }, {});

  Object.keys(itemsByCourse).forEach(courseName => {
    console.log('\n\n\n' + '='.repeat(80));
    console.log(`Course: ${courseName}`);
    console.log('='.repeat(80));
    
    itemsByCourse[courseName].forEach((item) => {
      const submission = item.submissions;
      
      console.log(`\n📄 ${item.plannable.title}`);
      console.log(`   📅 Due: ${item.plannable.due_at || 'No due date'}`);
      console.log(`   📊 Points: ${item.plannable.points_possible || 0}`);
      console.log(`   🔗 URL: ${item.html_url}`);
      console.log(`   📋 Status:`);
      console.log(`      ✅ Graded: ${submission.graded}`);
      console.log(`      ❌ Missing: ${submission.missing}`);
      console.log(`      ⚠️ Excused: ${submission.excused}`);
      console.log(`      📤 Submitted: ${submission.submitted}`);
      console.log(`      🔍 Needs Grading: ${submission.needs_grading}`);
      console.log(`      📝 Has Feedback: ${submission.has_feedback}`);
      console.log(`      🔄 Workflow State: ${submission.workflow_state}`);
      console.log(`   📦 Full Item Object:`);
      console.log(item);
      console.log('-'.repeat(60));
    });
  });
  
  // Summary
  console.log('\n\n\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  Object.keys(itemsByCourse).forEach(courseName => {
    const items = itemsByCourse[courseName];
    const graded = items.filter(item => item.submissions.graded).length;
    const missing = items.filter(item => item.submissions.missing).length;
    const submitted = items.filter(item => item.submissions.submitted).length;
    
    console.log(`🎓 ${courseName}:`);
    console.log(`   📝 Total assignments: ${items.length}`);
    console.log(`   ✅ Graded: ${graded}`);
    console.log(`   📤 Submitted: ${submitted}`);
    console.log(`   ❌ Missing: ${missing}`);
  });
})
.catch(error => console.error('❌ Error:', error));
