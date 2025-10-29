## **🧠 Hapi Academics Tab — Final Feature System**

### **1\. Smart Calendar & Planner (Canvas \+ Google \+ Hapi Core)**

The centerpiece of the new Academics hub — where study, scheduling, and accountability converge.

**Features:**

* **Unified Calendar View:**

  * Displays all Canvas assignments (via due-date API) alongside custom “study blocks.”

  * Syncs bi-directionally with Google Calendar (using Google Calendar API).

  * Color-coded by course and task type.

* **AI Study Coach Integration:**

  * Reads upcoming due dates, grades, and student availability → auto-creates a weekly study plan.

  * Suggests optimal focus times based on workload trends, deadlines, and mood.

  * Adjusts dynamically if assignments are turned in early or grades drop.

* **AI Scheduling Assistant:**

  * Conversational overlay: “Help me plan this week,” “Move my Biology review to Thursday,” etc.

  * Natural-language scheduling fully supported by Hapi’s internal planner (not Canvas write-back).

* **Load Meter & Alerts:**

  * Visual “academic load” gauge for each week.

  * Highlights over-scheduled days and suggests redistribution.

✅ **Feasibility:** Canvas Assignments API \+ Google Calendar API \+ Hapi internal logic  
 🧩 **Integration Type:** Mixed (Canvas data read-only; write actions via Hapi)

---

### **2\. Grades & Assignments Intelligence**

Turns raw grades into insight and motivation.

**Features:**

* **Smart Assignment Feed:**

  * Pulls all assignments with due date, points, status, and submission link.

  * Filters: All / Pending / Overdue / Completed.

* **AI Grade Path Projection:**

  * Calculates projected final grade per course:  
     *“If you average 88 % on the remaining assignments, you’ll finish with an A–.”*

* **Impact Indicator:**

  * Highlights high-weight assignments that influence GPA most.

* **Explain My Grade:**

  * AI reads instructor feedback (from Submissions API) → rewrites it in plain language with action advice.

  * Optional “Create an improvement plan” button generates a study checklist.

✅ **Feasibility:** Canvas Assignments & Submissions API \+ Hapi AI  
 🧩 **Integration Type:** Canvas \+ Hapi

---

### **3\. Course Tutor (AI Learning Companion)**

The embedded AI that actually teaches, answers questions, and guides comprehension.

**Features:**

* **Context-Aware Tutor Widget:**

  * Opens per course/module.

  * Knows course title, assignment names, descriptions.

  * Answers questions, generates practice quizzes, summarizes assignment instructions.

* **AI Resource Finder:**

  * Pulls topic keywords from assignment titles → fetches matched open-educational or instructor-approved materials from Hapi’s resource library.

* **Quick Review Generator:**

  * Summarizes the last five assignments per course into key study notes or flashcards.

✅ **Feasibility:** Canvas LTI launch context \+ Assignments API \+ Hapi content engine  
 🧩 **Integration Type:** Canvas \+ Hapi

---

### **4\. Mood × Performance Dashboard**

Fuses wellness with academic performance — the emotional-academic feedback loop.

**Features:**

* **Mood Tracking Widget:**

  * Daily quick-tap (“Energized / Neutral / Drained”).

  * Stored in Hapi and displayed alongside academic data.

* **Correlation Graph:**

  * Displays grade averages vs mood trend over time.

  * AI gives insights:  
     *“You tend to perform 12 % higher on weeks with stable sleep and positive mood.”*

* **Proactive Care Prompts:**

  * If mood declines and workload spikes, the AI coach suggests breaks, mindfulness, or contact with advisors.

✅ **Feasibility:** Grades API \+ Hapi mood data  
 🧩 **Integration Type:** Canvas \+ Hapi

---

### **5\. Instructor Feedback Hub**

Centralized reflection space that transforms instructor comments into growth fuel.

**Features:**

* Pulls all submission feedback & rubrics from every course.

* AI sentiment analysis and pattern recognition (e.g., “Your instructors often mention ‘structure’ and ‘clarity’—focus on essay outlines.”).

* Option to convert feedback into personalized improvement goals stored in Hapi.

✅ **Feasibility:** Canvas Submissions API \+ Hapi AI  
 🧩 **Integration Type:** Canvas \+ Hapi

---

### **6\. Micro-Assignments & Reflections (Canvas LTI Grade Pass-Back)**

Compact, low-friction tasks that connect wellbeing and coursework.

**Features:**

* **LTI-Deep-Linked Quizzes & Reflections:**

  * Students complete mood or comprehension check-ins directly within Canvas modules.

  * Grades returned via LTI AGS (Assignment & Grading Services).

* **Auto-Feedback Mode:**

  * Immediate AI response summarizing the student’s reflection and giving next-steps advice.

✅ **Feasibility:** 100 % Canvas-native (LTI AGS)  
 🧩 **Integration Type:** Canvas \+ Hapi

---

### **7\. Gamified Academic Progress**

Light, non-intrusive motivation mechanics that reward consistency.

**Features:**

* Progress bars per course showing assignment completion rate.

* Study streak tracker integrated with planner sessions.

* Achievements like *“Completed all assignments on time this month”*.

* Optional LTI assignment for extra-credit badge submissions.

✅ **Feasibility:** Canvas Assignments API \+ Hapi Gamification logic  
 🧩 **Integration Type:** Canvas \+ Hapi

---

### **8\. AI Notifications & Accountability System**

Keeps students aware, on-track, and emotionally balanced.

**Features:**

* Smart notifications combining Canvas data and Hapi mood/behavior triggers:

  * “Two assignments due tomorrow — 90 min study block added for tonight.”

  * “Mood low \+ 3 deadlines ahead — schedule light review session?”

* AI can auto-suggest new study blocks or shift existing ones via the Hapi calendar.

* Sends reminders via email, SMS, or push (outside Canvas, fully compliant).

✅ **Feasibility:** Canvas Assignments API \+ Hapi scheduler  
 🧩 **Integration Type:** Canvas \+ Hapi

