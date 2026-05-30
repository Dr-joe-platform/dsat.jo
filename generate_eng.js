const fs = require('fs');

const engQs = [
  {
    text: 'As used in the text, what does the word "projection" most nearly mean?',
    passage: 'The following text is from Northrop Frye\'s 1957 book Anatomy of Criticism.\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.',
    type: 'MC',
    options: ['Elimination', 'Estimation', 'Presentation', 'Prediction'],
    correctAnswer: 'C',
    difficulty: 'Medium',
    skill: 'Words in Context',
    domain: 'Craft and Structure'
  },
  {
    text: 'Which choice best describes the function of the underlined portion in the text as a whole?',
    passage: 'Imani Jacqueline Brown is an artist who blends scientific research, political activism, and various media in her work. In her exhibition Strike Gulf, she interrogated the impact of the oil and gas industry on southern Louisiana (where she grew up), <u>incorporating core samples from deep seabeds off the Louisiana coast, oil well data, archival information about oil boycotts, and video she took in New Orleans.</u> Strike Gulf thus stands as an example of Brown\'s multidisciplinary approach and use of diverse sources.',
    type: 'MC',
    options: [
      'It notes some challenges Brown faced in creating the specific exhibition that is discussed in the text.',
      'It describes a project of Brown’s that deviates from the typical approach that is described earlier in the text.',
      'It lists specific examples of the diverse materials that are referenced in the sentence that follows it.',
      'It explains the process by which Brown obtained the specific materials that are discussed in the text.'
    ],
    correctAnswer: 'C',
    difficulty: 'Medium',
    skill: 'Text Structure and Purpose',
    domain: 'Craft and Structure'
  },
  {
    text: 'Which choice most logically completes the text?',
    passage: 'When researchers measured the effects of high-intensity interval training (HIIT) on mitochondrial function in older adults, they noted significant improvements. Mitochondria are the powerhouses of the cell, and their efficiency typically declines with age. However, the study revealed that participants who engaged in HIIT for 12 weeks experienced a 49% increase in mitochondrial capacity. The researchers concluded that ______',
    type: 'MC',
    options: [
      'HIIT is the only form of exercise that can improve cardiovascular health in older adults.',
      'mitochondrial function is entirely independent of age and is influenced only by physical activity levels.',
      'engaging in HIIT can effectively counteract some of the cellular decline typically associated with aging.',
      'older adults should avoid other forms of exercise in order to maximize their mitochondrial capacity.'
    ],
    correctAnswer: 'C',
    difficulty: 'Easy',
    skill: 'Command of Evidence',
    domain: 'Information and Ideas'
  },
  {
    text: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
    passage: 'Many historians have argued that the Industrial Revolution was driven primarily by technological innovations such as the steam engine. However, recent scholarship suggests that ______ shifts in global trade networks and the accumulation of wealth from colonial enterprises played an equally crucial role in providing the necessary capital.',
    type: 'MC',
    options: ['significant;', 'significant,', 'significant', 'significant:'],
    correctAnswer: 'C',
    difficulty: 'Medium',
    skill: 'Boundaries',
    domain: 'Standard English Conventions'
  },
  {
    text: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
    passage: 'To ensure that the new software would be compatible with older operating systems, the developers conducted extensive backward-compatibility testing. They tested the application on various legacy systems, identified several critical bugs, and ______.',
    type: 'MC',
    options: [
      'they fix them before the official release.',
      'fixing them before the official release.',
      'fixed them before the official release.',
      'to fix them before the official release.'
    ],
    correctAnswer: 'C',
    difficulty: 'Easy',
    skill: 'Form, Structure, and Sense',
    domain: 'Standard English Conventions'
  }
];

function generateModule(moduleName, numQuestions) {
  const qs = [];
  for (let i = 0; i < numQuestions; i++) {
    const base = engQs[i % engQs.length];
    qs.push({
      id: `ENG_${moduleName}_Q${i + 1}`,
      module: moduleName === 'M1' ? 1 : 2,
      ...base
    });
  }
  return qs;
}

const engTest1 = {
  name: 'Reading & Writing Mock Test 1',
  subject: 'Reading & Writing',
  M1: generateModule('M1', 27),
  M2H: generateModule('M2H', 27),
  M2E: generateModule('M2E', 27),
};

const output = `\nexport const ENG_TEST_1_DATA: DSATTestData = ${JSON.stringify(engTest1, null, 2)};\n`;
fs.appendFileSync('src/lib/questions-data.ts', output);
console.log('Appended ENG_TEST_1_DATA');
