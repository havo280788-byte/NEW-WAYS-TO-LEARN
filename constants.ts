import { Passage, QuestionType, UserProgress } from './types';

export const DEFAULT_PASSAGES: Passage[] = [
  {
    id: 'p1',
    title: 'Blended Learning: A New Approach',
    topic: 'Modern Education',
    estimatedTime: 10,
    content: `
# Blended Learning: A New Approach

Blended learning is a way of studying that combines online video materials and traditional classroom methods. It requires the physical presence of both teacher and student, with some elements of student control over time, place, path, or pace.

In a blended learning course, students might attend a class taught by a teacher in a traditional classroom setting, while also independently completing online components of the course outside of the classroom. In this case, in-class time may be replaced by online learning experiences, and online learning would act as a complement to the in-class materials.

This approach allows for more personalized education. Teachers can use data from online tests to help students who are struggling. Meanwhile, students who master the material quickly can move on to more challenging tasks.
    `,
    questions: [
      {
        id: 'q1_1',
        text: 'What is the main definition of blended learning?',
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: 'easy',
        options: [
          { id: 'A', text: 'Studying only through online videos.' },
          { id: 'B', text: 'Traditional classroom methods without technology.' },
          { id: 'C', text: 'A combination of online materials and traditional classroom methods.' },
          { id: 'D', text: 'Homeschooling with a tutor.' }
        ],
        correctAnswerId: 'C',
        explanation: 'The text states that blended learning "combines online video materials and traditional classroom methods".'
      },
      {
        id: 'q1_2',
        text: 'In blended learning, students have no control over their learning pace.',
        type: QuestionType.TRUE_FALSE,
        difficulty: 'medium',
        options: [
          { id: 'true', text: 'True' },
          { id: 'false', text: 'False' }
        ],
        correctAnswerId: 'false',
        explanation: 'The text mentions "some elements of student control over time, place, path, or pace".'
      },
      {
        id: 'q1_3',
        text: 'How can teachers benefit from blended learning according to the text?',
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: 'medium',
        options: [
          { id: 'A', text: 'They can work fewer hours.' },
          { id: 'B', text: 'They can use data to help struggling students.' },
          { id: 'C', text: 'They do not need to prepare lesson plans.' },
          { id: 'D', text: 'They can replace in-class time completely.' }
        ],
        correctAnswerId: 'B',
        explanation: 'The passage says: "Teachers can use data from online tests to help students who are struggling."'
      }
    ]
  },
  {
    id: 'p2',
    title: 'Mobile Devices in the Classroom',
    topic: 'Technology',
    estimatedTime: 8,
    content: `
# Mobile Devices in the Classroom

For many years, schools banned mobile phones, regarding them as distractions. However, in the unit "New Ways to Learn", we explore how mobile devices can actually support education.

Smartphones and tablets provide instant access to the internet, allowing students to search for information, access digital textbooks, and use educational apps. Apps like Quizlet or Kahoot turn learning into a game, making it more engaging.

However, there are challenges. Not all students can afford expensive devices, leading to a digital divide. Furthermore, without proper rules, students might use devices for social media instead of learning. Therefore, strict guidelines are necessary for mobile learning to be effective.
    `,
    questions: [
      {
        id: 'q2_1',
        text: 'Schools have always encouraged the use of mobile phones.',
        type: QuestionType.TRUE_FALSE,
        difficulty: 'easy',
        options: [
          { id: 'true', text: 'True' },
          { id: 'false', text: 'False' }
        ],
        correctAnswerId: 'false',
        explanation: 'The text says: "For many years, schools banned mobile phones, regarding them as distractions."'
      },
      {
        id: 'q2_2',
        text: 'What is mentioned as a benefit of mobile devices?',
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: 'medium',
        options: [
          { id: 'A', text: 'They prevent students from playing games.' },
          { id: 'B', text: 'They allow instant access to information and educational apps.' },
          { id: 'C', text: 'They are cheap for everyone.' },
          { id: 'D', text: 'They replace teachers completely.' }
        ],
        correctAnswerId: 'B',
        explanation: 'The text states they "provide instant access to the internet... and use educational apps".'
      },
      {
        id: 'q2_3',
        text: 'What is a major challenge mentioned in the text?',
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: 'hard',
        options: [
          { id: 'A', text: 'Digital divide due to cost.' },
          { id: 'B', text: 'Lack of electricity.' },
          { id: 'C', text: 'Teachers do not know how to use phones.' },
          { id: 'D', text: 'Screens are too small.' }
        ],
        correctAnswerId: 'A',
        explanation: 'The text mentions: "Not all students can afford expensive devices, leading to a digital divide."'
      }
    ]
  }
];

export const INITIAL_PROGRESS: UserProgress = {
  totalPoints: 0,
  level: 1,
  completedPassages: [],
  streakDays: 1,
  lastActiveDate: new Date().toISOString(),
  accuracy: 0,
  totalQuestionsAnswered: 0,
  weakTopics: []
};

export const SOUNDS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
};

export const LEARNING_QUEST_PASSAGE = `
# The Evolution of Learning

Education has changed dramatically over the years. Traditionally, learning took place exclusively in physical classrooms where teachers delivered lectures and students took notes. However, the digital revolution has introduced "New Ways to Learn" that are transforming this landscape.

**Mobile Devices and Apps**
Smartphones and tablets have become powerful educational tools. Educational apps like Duolingo or Quizlet turn learning into a game, making it more engaging. Instead of banning mobile devices, many modern schools now integrate them into lessons to provide instant access to information.

**Blended Learning**
One of the most popular modern approaches is **blended learning**, which combines online digital media with traditional classroom methods. This allows students to have some element of control over time, place, path, or pace. For example, students might watch video lectures at home and use class time for discussions and problem-solving.

**Online and Distance Learning**
Distance learning allows students to learn from home using the internet. This is particularly useful for those who cannot attend physical schools. Online courses offer flexibility, meaning students can study whenever and wherever they want. Virtual education usually takes place on digital platforms where materials are stored in **cloud libraries**, allowing easy access to textbooks and resources.

**Artificial Intelligence**
AI is the newest frontier in education. AI assistants and tutors can personalize learning paths for students, identifying their weak points and suggesting specific resources. While some fear AI might replace teachers, its true value lies in supporting them and creating more effective, personalized learning experiences.

In conclusion, technology is not replacing traditional education but enhancing it. Digital tools support more effective learning, helping students prepare for a future driven by innovation.
`;

export const LEARNING_QUEST_POOL = [
  {
    id: 'lq1',
    question: "Distance learning allows students to ____.",
    options: [
      { id: 'A', text: "study without teachers" },
      { id: 'B', text: "learn from home using the Internet" },
      { id: 'C', text: "avoid homework" },
      { id: 'D', text: "skip exams" }
    ],
    correctAnswerId: "B"
  },
  {
    id: 'lq2',
    question: "Which is an example of an educational app?",
    options: [
      { id: 'A', text: "Duolingo" },
      { id: 'B', text: "Facebook" },
      { id: 'C', text: "YouTube Music" },
      { id: 'D', text: "Google Maps" }
    ],
    correctAnswerId: "A"
  },
  {
    id: 'lq3',
    question: "Cloud libraries help students to ____.",
    options: [
      { id: 'A', text: "store physical books" },
      { id: 'B', text: "access digital materials online" },
      { id: 'C', text: "print documents" },
      { id: 'D', text: "play games" }
    ],
    correctAnswerId: "B"
  },
  {
    id: 'lq4',
    question: "Virtual education usually takes place ____.",
    options: [
      { id: 'A', text: "in a traditional classroom" },
      { id: 'B', text: "on digital platforms" },
      { id: 'C', text: "in outdoor camps" },
      { id: 'D', text: "in libraries only" }
    ],
    correctAnswerId: "B"
  },
  {
    id: 'lq5',
    question: "One advantage of online courses is that they are ____.",
    options: [
      { id: 'A', text: "always free" },
      { id: 'B', text: "flexible in time and place" },
      { id: 'C', text: "easier than school" },
      { id: 'D', text: "without teachers" }
    ],
    correctAnswerId: "B"
  },
  {
    id: 'lq6',
    question: "Blended learning combines ____.",
    options: [
      { id: 'A', text: "books and music" },
      { id: 'B', text: "online and face-to-face learning" },
      { id: 'C', text: "tests and homework" },
      { id: 'D', text: "videos and games" }
    ],
    correctAnswerId: "B"
  },
  {
    id: 'lq7',
    question: "AI in education can help by ____.",
    options: [
      { id: 'A', text: "replacing all teachers" },
      { id: 'B', text: "personalizing learning paths" },
      { id: 'C', text: "removing exams" },
      { id: 'D', text: "reducing study time" }
    ],
    correctAnswerId: "B"
  },
  {
    id: 'lq8',
    question: "Online tests are useful because they ____.",
    options: [
      { id: 'A', text: "give instant feedback" },
      { id: 'B', text: "eliminate mistakes" },
      { id: 'C', text: "replace study" },
      { id: 'D', text: "require no preparation" }
    ],
    correctAnswerId: "A"
  },
  {
    id: 'lq9',
    question: "Which skill is important in digital learning?",
    options: [
      { id: 'A', text: "Ignoring information" },
      { id: 'B', text: "Memorizing without thinking" },
      { id: 'C', text: "Evaluating online sources" },
      { id: 'D', text: "Avoiding technology" }
    ],
    correctAnswerId: "C"
  },
  {
    id: 'lq10',
    question: "The main message of 'New Ways to Learn' is that ____.",
    options: [
      { id: 'A', text: "technology replaces traditional education" },
      { id: 'B', text: "digital tools support more effective learning" },
      { id: 'C', text: "schools are no longer necessary" },
      { id: 'D', text: "AI controls education" }
    ],
    correctAnswerId: "B"
  }
];