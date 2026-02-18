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
# Apps of the Future

How many times a day do you tap the icon of your favourite social media site or play a game on your smartphone? When your parents were young, apps didn’t even exist, but now we can’t imagine our lives without them. So what will apps be like in the future?

**A new way to learn**
Apps are being used in education. They are useful because students can use them anytime, anywhere and on any device. They present information in **bite-sized chunks**, which people find easy to understand and remember. Lessons can also be turned into games, making learning fun! Soon, apps will be the new normal.

**Augmented Reality (AR)**
Inside AR apps, the real world is mixed with the digital one. These apps are downloaded and teachers use them to make learning more interesting. These apps capture students’ attention and help them concentrate and interact with their lessons. Students can experience the material and become more interested in the subject. At the same time, they can explore the topic taught at their own pace.

**Future Impact**
In the future, apps will be able to do a lot of things for us. Some people think this will have a lot of benefits, others think it will make us lazy or that we will forget how to do things for ourselves. Whatever your opinion on modern technology, one thing is certain: the **apps of the future will change our lives**.
`;

export const LEARNING_QUEST_POOL = [
  {
    id: 'lq1',
    question: "The first apps appeared over 50 years ago.",
    options: [
      { id: 'T', text: "True" },
      { id: 'F', text: "False" },
      { id: 'DS', text: "Doesn't say" }
    ],
    correctAnswerId: "DS"
  },
  {
    id: 'lq2',
    question: "You can only use educational apps on smartphones.",
    options: [
      { id: 'T', text: "True" },
      { id: 'F', text: "False" },
      { id: 'DS', text: "Doesn't say" }
    ],
    correctAnswerId: "F"
  },
  {
    id: 'lq3',
    question: "Some apps already use augmented reality.",
    options: [
      { id: 'T', text: "True" },
      { id: 'F', text: "False" },
      { id: 'DS', text: "Doesn't say" }
    ],
    correctAnswerId: "T"
  },
  {
    id: 'lq4',
    question: "AR apps make lessons boring.",
    options: [
      { id: 'T', text: "True" },
      { id: 'F', text: "False" },
      { id: 'DS', text: "Doesn't say" }
    ],
    correctAnswerId: "F"
  },
  {
    id: 'lq5',
    question: "Everyone believes apps will make us lazy.",
    options: [
      { id: 'T', text: "True" },
      { id: 'F', text: "False" },
      { id: 'DS', text: "Doesn't say" }
    ],
    correctAnswerId: "F"
  },
  {
    id: 'lq6',
    question: "The author’s purpose is to …",
    options: [
      { id: 'A', text: "give us information about how apps are developing." },
      { id: 'B', text: "explain predictions about future technology in education." },
      { id: 'C', text: "inform us how to use the apps more efficiently." },
      { id: 'D', text: "give us tips on choosing apps." }
    ],
    correctAnswerId: "B"
  },
  {
    id: 'lq7',
    question: "How do educational apps usually present information?",
    options: [
      { id: 'A', text: "In long and complicated paragraphs" },
      { id: 'B', text: "In short and easy-to-understand chunks" },
      { id: 'C', text: "Only through videos" },
      { id: 'D', text: "Without any explanation" }
    ],
    correctAnswerId: "B"
  },
  {
    id: 'lq8',
    question: "What does the writer suggest about the future of apps?",
    options: [
      { id: 'A', text: "Apps will disappear soon." },
      { id: 'B', text: "Apps will become more limited." },
      { id: 'C', text: "Apps will become even more advanced and useful." },
      { id: 'D', text: "Apps will stop using technology." }
    ],
    correctAnswerId: "C"
  }
];

// Compatibility for remote files that might not have been deleted
export const OCEAN_PASSAGE = '';
export const OCEAN_QUESTION_POOL: any[] = [];