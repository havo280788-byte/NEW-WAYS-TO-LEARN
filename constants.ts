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