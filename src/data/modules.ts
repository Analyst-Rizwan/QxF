import type { QuizQuestion } from '@/components/stages/QuizStage'

export type { QuizQuestion }

export interface VisualizerStep {
  line: number // 0-indexed
  vars: Record<string, string>
  output: string
  explanation: string
}

export interface SandboxChallenge {
  title: string
  description: string
  starterCode: string
  hint: string
  solution: string
  successCheck?: string // substring to check in output
}

export interface SandboxConfig {
  starterCode: string
  challenge: string
  successHint: string
  challenges?: SandboxChallenge[]
}

export interface HookConfig {
  analogy: string
  emoji: string
  steps: { label: string; delay: number }[]
  insight: string
  insightDetail: string
  mapping: { left: string; right: string }[]
}

export interface Module {
  slug: string
  title: string
  gradeBand: '9-10' | '11-12'
  description: string
  icon: string
  color: string
  xpReward: number
  prerequisites: string[]
  stages: string[]
  visualizerSteps: VisualizerStep[]
  codeLines: string[]
  sandboxConfig: SandboxConfig
  quizQuestions: QuizQuestion[]
  hookConfig?: HookConfig
  tutorPresetQuestions?: string[]
  completionSummary?: { icon: string; text: string }[]
}

export const MODULES: Record<string, Module> = {
  m1: {
    slug: 'm1',
    title: 'What is a Program?',
    gradeBand: '9-10',
    description: 'Understand what programs are, how variables store information, and watch code run step by step.',
    icon: '💡',
    color: 'amber',
    xpReward: 100,
    prerequisites: [],
    stages: ['hook', 'visualizer', 'sandbox', 'tutor', 'quiz'],
    hookConfig: {
      analogy: 'auto-rickshaw',
      emoji: '🛺',
      steps: [
        { label: 'Turn left', delay: 0 },
        { label: 'Go 200m', delay: 2000 },
        { label: 'Stop', delay: 4000 },
      ],
      insight: "That's a program.",
      insightDetail:
        'A program is a list of instructions that a computer follows, one step at a time — just like the auto followed the directions.',
      mapping: [
        { left: '"Turn left"', right: 'name = "Priya"' },
        { left: '"Go 200m"', right: 'age = 17' },
        { left: '"Stop"', right: 'print(message)' },
      ],
    },
    tutorPresetQuestions: [
      'Why do we need variables?',
      'What happens if I type print without quotes?',
      'Can Python do math?',
    ],
    codeLines: [
      'name = "Priya"          # step 1',
      'age = 17                # step 2',
      'city = "Coimbatore"     # step 3',
      'message = "Hello " + name  # step 4',
      'print(message)          # step 5',
    ],
    visualizerSteps: [
      { line: 0, vars: { name: '"Priya"' }, output: '', explanation: 'We store the text "Priya" in a box called name.' },
      { line: 1, vars: { name: '"Priya"', age: '17' }, output: '', explanation: 'We store the number 17 in a box called age.' },
      { line: 2, vars: { name: '"Priya"', age: '17', city: '"Coimbatore"' }, output: '', explanation: 'We store the city name in a box called city.' },
      { line: 3, vars: { name: '"Priya"', age: '17', city: '"Coimbatore"', message: '"Hello Priya"' }, output: '', explanation: 'We join "Hello " and name together to make a greeting.' },
      { line: 4, vars: { name: '"Priya"', age: '17', city: '"Coimbatore"', message: '"Hello Priya"' }, output: 'Hello Priya', explanation: 'print() shows the message on the screen. This is the output!' },
    ],
    sandboxConfig: {
      starterCode: `name = "Priya"\nage = 17\ncity = "Coimbatore"\nmessage = "Hello " + name\nprint(message)`,
      challenge: 'Change the name, age, or city to yours — then click Run to see your own output!',
      successHint: '🎉 You just ran real Python code! Try changing the name to yours and run it again.',
      challenges: [
        {
          title: 'Change Your Name',
          description: 'Replace "Priya" with your own name and run the code.',
          starterCode: `name = "Priya"\nage = 17\ncity = "Coimbatore"\nmessage = "Hello " + name\nprint(message)`,
          hint: 'Find the line with name = "Priya" and change "Priya" to your name. Keep the quotes!',
          solution: `name = "Arjun"\nage = 16\ncity = "Chennai"\nmessage = "Hello " + name\nprint(message)`,
          successCheck: 'Hello',
        },
        {
          title: 'Build Your Own Message',
          description: 'Change the message to say "I am from [your city]" using variables.',
          starterCode: `name = "Priya"\ncity = "Coimbatore"\nmessage = "I am from " + city\nprint(message)`,
          hint: 'The message variable can combine any text and variables using +',
          solution: `name = "Arjun"\ncity = "Chennai"\nmessage = "I am from " + city\nprint(message)`,
          successCheck: 'I am from',
        },
        {
          title: 'Two print() Statements',
          description: 'Print two things: first the greeting, then the city. Use two print() lines.',
          starterCode: `name = "Priya"\ncity = "Coimbatore"\ngreeting = "Hello " + name\nprint(greeting)\n# Add another print() below\n`,
          hint: 'Add: print("I am from " + city) on a new line after the first print.',
          solution: `name = "Priya"\ncity = "Coimbatore"\ngreeting = "Hello " + name\nprint(greeting)\nprint("I am from " + city)`,
          successCheck: 'Hello',
        },
      ],
    },
    quizQuestions: [
      { question: 'What is a program?', options: ['A TV show', 'A list of instructions a computer follows', 'A type of computer virus', 'A calculator app'], correctIndex: 1, explanation: 'A program is a sequence of instructions that tells a computer what to do, step by step.' },
      { question: 'In Python, what does a variable do?', options: ['It deletes data', 'It runs the program faster', 'It stores a piece of information with a name', 'It prints text on screen'], correctIndex: 2, explanation: 'A variable is like a labelled box. You give it a name and store data in it — like name = "Priya".' },
      { question: 'What does print(message) do?', options: ['Saves the file to disk', 'Creates a new variable called message', 'Deletes the variable', 'Shows the value of message on the screen'], correctIndex: 3, explanation: 'print() is a built-in Python function that displays whatever you pass to it as output.' },
      { question: 'In the program we studied, what is the value of message?', options: ['"Hello Coimbatore"', '"Hello Priya"', '"Hello 17"', 'Priya'], correctIndex: 1, explanation: 'message = "Hello " + name — and name is "Priya", so message becomes "Hello Priya".' },
      { question: 'Which line runs LAST in our 5-line program?', options: ['name = "Priya"', 'age = 17', 'message = "Hello " + name', 'print(message)'], correctIndex: 3, explanation: 'Python runs code top to bottom, one line at a time. print(message) is line 5 — the last to run.' },
    ],
    completionSummary: [
      { icon: '💡', text: 'Programs are instructions a computer follows' },
      { icon: '📦', text: 'Variables store information in named boxes' },
      { icon: '🔍', text: 'Code runs one line at a time, top to bottom' },
      { icon: '🖨️', text: 'print() shows output on the screen' },
    ],
  },

  m2: {
    slug: 'm2',
    title: 'Conditions & Decisions',
    gradeBand: '9-10',
    description: 'Learn how computers make decisions using if/else — just like a traffic light or a school gate.',
    icon: '🚦',
    color: 'blue',
    xpReward: 120,
    prerequisites: ['m1'],
    stages: ['hook', 'visualizer', 'sandbox', 'tutor', 'quiz'],
    hookConfig: {
      analogy: 'traffic-light',
      emoji: '🚦',
      steps: [
        { label: 'Check: is light RED?', delay: 0 },
        { label: 'If yes → STOP', delay: 2000 },
        { label: 'If no → GO', delay: 4000 },
      ],
      insight: "That's an if/else.",
      insightDetail:
        'A traffic light checks a condition and makes a decision. In Python, if/else does the same thing — it checks something and runs different code depending on the answer.',
      mapping: [
        { left: 'Is light red?', right: 'if score >= 40:' },
        { left: 'If yes → STOP', right: '    print("Pass!")' },
        { left: 'If no → GO', right: 'else: print("Try again")' },
      ],
    },
    tutorPresetQuestions: [
      'What does if/else actually do?',
      'Can I have more than two choices?',
      'What does >= mean?',
    ],
    codeLines: [
      'score = 75              # step 1',
      'if score >= 40:         # step 2',
      '    print("Pass!")      # step 3',
      'else:                   # step 4',
      '    print("Try again")  # step 5',
    ],
    visualizerSteps: [
      { line: 0, vars: { score: '75' }, output: '', explanation: 'We store the score 75 in a variable called score.' },
      { line: 1, vars: { score: '75' }, output: '', explanation: 'Python checks: is score >= 40? 75 is bigger than 40, so this is TRUE.' },
      { line: 2, vars: { score: '75', condition: 'TRUE' }, output: 'Pass!', explanation: 'The condition was true, so we run the if block. "Pass!" is printed.' },
      { line: 3, vars: { score: '75', condition: 'TRUE' }, output: 'Pass!', explanation: 'The else block is SKIPPED because the if was true. Python only runs one branch.' },
      { line: 4, vars: { score: '75', condition: 'TRUE' }, output: 'Pass!', explanation: 'Done! The computer made a decision based on the score and printed the right message.' },
    ],
    sandboxConfig: {
      starterCode: `score = 75\nif score >= 40:\n    print("Pass!")\nelse:\n    print("Try again")`,
      challenge: 'Change the score to 30. What happens? Then try 100. Try to understand why!',
      successHint: '🎉 You just made the computer make a decision! That\'s the power of if/else.',
      challenges: [
        {
          title: 'Change the Score',
          description: 'Change score to 30 and run. Then try 40 and 100. What changes?',
          starterCode: `score = 75\nif score >= 40:\n    print("Pass!")\nelse:\n    print("Try again")`,
          hint: 'Change the number after score = and re-run. Watch what prints!',
          solution: `score = 30\nif score >= 40:\n    print("Pass!")\nelse:\n    print("Try again")`,
          successCheck: 'again',
        },
        {
          title: 'Add an elif',
          description: 'Add a third choice: if score >= 75, print "Distinction!". If >= 40, print "Pass!". Otherwise "Try again".',
          starterCode: `score = 80\nif score >= 75:\n    print("Distinction!")\nelif score >= 40:\n    print("Pass!")\nelse:\n    print("Try again")`,
          hint: 'elif is short for "else if". It lets you check more conditions!',
          solution: `score = 80\nif score >= 75:\n    print("Distinction!")\nelif score >= 40:\n    print("Pass!")\nelse:\n    print("Try again")`,
          successCheck: 'Distinction',
        },
        {
          title: 'Even or Odd?',
          description: 'Write code that prints "Even!" if a number is even, or "Odd!" if it is odd. Hint: use % (modulo).',
          starterCode: `number = 7\n# Use: if number % 2 == 0:\n`,
          hint: 'number % 2 gives the remainder when divided by 2. If remainder is 0, the number is even!',
          solution: `number = 7\nif number % 2 == 0:\n    print("Even!")\nelse:\n    print("Odd!")`,
          successCheck: 'Odd',
        },
      ],
    },
    quizQuestions: [
      { question: 'What does an if statement do?', options: ['Repeats code many times', 'Checks a condition and runs code only if it is true', 'Defines a new variable', 'Stops the program'], correctIndex: 1, explanation: 'An if statement checks whether a condition is true. If it is, the indented code underneath runs.' },
      { question: 'In our program: if score >= 40. What does >= mean?', options: ['Less than', 'Exactly equal', 'Greater than or equal to', 'Not equal'], correctIndex: 2, explanation: '>= means "greater than or equal to". So score >= 40 is true if score is 40 or anything above 40.' },
      { question: 'What happens to the else block when the if condition is TRUE?', options: ['It runs first', 'It is skipped', 'It runs at the same time', 'It causes an error'], correctIndex: 1, explanation: 'When an if condition is true, only the if block runs. The else block is completely skipped.' },
      { question: 'Which keyword lets you check a third condition?', options: ['otherwise', 'elif', 'elseif', 'check'], correctIndex: 1, explanation: 'elif is short for "else if". It lets you chain multiple conditions together.' },
      { question: 'What is the output of: if 5 > 10: print("A") else: print("B")?', options: ['A', 'B', 'AB', 'Error'], correctIndex: 1, explanation: '5 > 10 is FALSE (5 is smaller than 10), so the if block is skipped and the else block runs, printing "B".' },
    ],
    completionSummary: [
      { icon: '🚦', text: 'if/else lets computers make decisions' },
      { icon: '✅', text: 'The if block only runs when the condition is true' },
      { icon: '🔄', text: 'elif adds a third (or more) choice' },
      { icon: '⚖️', text: 'Comparison operators: ==, !=, >, <, >=, <=' },
    ],
  },

  m3: {
    slug: 'm3',
    title: 'Loops',
    gradeBand: '9-10',
    description: 'Learn how to repeat actions without writing the same code multiple times — the power of for and while loops.',
    icon: '🔁',
    color: 'green',
    xpReward: 130,
    prerequisites: ['m1', 'm2'],
    stages: ['hook', 'visualizer', 'sandbox', 'tutor', 'quiz'],
    hookConfig: {
      analogy: 'chai',
      emoji: '☕',
      steps: [
        { label: 'Boil water', delay: 0 },
        { label: 'Add ingredients → stir', delay: 2000 },
        { label: 'Repeat stirring 5 times', delay: 4000 },
      ],
      insight: "That's a loop.",
      insightDetail:
        'When you make chai, you stir it multiple times — the same action repeated. In Python, a loop does the same thing: it repeats a block of code a set number of times.',
      mapping: [
        { left: 'Stir 5 times', right: 'for i in range(5):' },
        { left: 'Each stir action', right: '    print("Stirring...")' },
        { left: 'Count the stirs', right: 'i = 0, 1, 2, 3, 4' },
      ],
    },
    tutorPresetQuestions: [
      'What is range() and how does it work?',
      'What is the difference between for and while?',
      'How do I stop a loop early?',
    ],
    codeLines: [
      'for i in range(5):      # step 1',
      '    print("Step", i+1)  # step 2',
      '# (loop runs 5 times)   # step 3',
    ],
    visualizerSteps: [
      { line: 0, vars: { i: '0' }, output: '', explanation: 'The loop starts. range(5) means i will take values 0,1,2,3,4. First value: i = 0.' },
      { line: 1, vars: { i: '0' }, output: 'Step 1', explanation: 'We print "Step" and i+1 (which is 0+1=1). Output: "Step 1". Loop goes back to the top.' },
      { line: 0, vars: { i: '1' }, output: 'Step 1', explanation: 'Second loop. i is now 1.' },
      { line: 1, vars: { i: '1' }, output: 'Step 1\nStep 2', explanation: 'Print "Step 2" (i+1 = 1+1 = 2). Loop continues.' },
      { line: 1, vars: { i: '4' }, output: 'Step 1\nStep 2\nStep 3\nStep 4\nStep 5', explanation: 'After i=4, we print "Step 5". range(5) is done — loop ends. Total: 5 steps printed.' },
    ],
    sandboxConfig: {
      starterCode: `for i in range(5):\n    print("Step", i+1)`,
      challenge: 'Change the 5 to 10 — how many lines print? Then try printing just the value of i.',
      successHint: '🎉 Loops are one of the most powerful concepts in programming. You just used one!',
      challenges: [
        {
          title: 'Count to 10',
          description: 'Change the loop so it prints numbers 1 through 10.',
          starterCode: `for i in range(5):\n    print("Step", i+1)`,
          hint: 'Change range(5) to range(10). i+1 will then go from 1 to 10.',
          solution: `for i in range(10):\n    print("Step", i+1)`,
          successCheck: 'Step 10',
        },
        {
          title: 'Sum with a Loop',
          description: 'Use a loop to add up numbers 1 to 5. Print the total at the end.',
          starterCode: `total = 0\nfor i in range(1, 6):\n    total = total + i\nprint("Total:", total)`,
          hint: 'range(1, 6) gives 1,2,3,4,5. We add each to total.',
          solution: `total = 0\nfor i in range(1, 6):\n    total = total + i\nprint("Total:", total)`,
          successCheck: 'Total: 15',
        },
        {
          title: 'While Loop',
          description: 'Use a while loop to print a countdown: 5, 4, 3, 2, 1, "Blast off!"',
          starterCode: `count = 5\nwhile count > 0:\n    print(count)\n    count = count - 1\nprint("Blast off!")`,
          hint: 'while keeps looping as long as the condition is true. count = count - 1 reduces it each time.',
          solution: `count = 5\nwhile count > 0:\n    print(count)\n    count = count - 1\nprint("Blast off!")`,
          successCheck: 'Blast off',
        },
      ],
    },
    quizQuestions: [
      { question: 'What does a for loop do?', options: ['Runs code once if a condition is true', 'Repeats code a set number of times', 'Defines a new variable', 'Stops the program'], correctIndex: 1, explanation: 'A for loop repeats a block of code a set number of times. range(5) means repeat 5 times.' },
      { question: 'What does range(5) produce?', options: ['1, 2, 3, 4, 5', '0, 1, 2, 3, 4', '0, 1, 2, 3, 4, 5', '5, 4, 3, 2, 1'], correctIndex: 1, explanation: 'range(5) produces 0, 1, 2, 3, 4 — five numbers starting from 0. To get 1-5, use range(1, 6).' },
      { question: 'In "for i in range(3): print(i)", what does i equal in the last loop?', options: ['3', '2', '1', '0'], correctIndex: 1, explanation: 'range(3) gives 0, 1, 2. The last value is 2.' },
      { question: 'What is the difference between for and while?', options: ['for loops run forever; while loops do not', 'for loops repeat a fixed number of times; while loops repeat while a condition is true', 'They are exactly the same', 'while loops are faster'], correctIndex: 1, explanation: 'A for loop repeats a known number of times. A while loop repeats as long as a condition stays true.' },
      { question: 'If you wrote: for i in range(3): print("Hi"), how many times does "Hi" print?', options: ['1', '2', '3', '0'], correctIndex: 2, explanation: 'range(3) gives three values (0, 1, 2), so the loop body runs 3 times, printing "Hi" three times.' },
    ],
    completionSummary: [
      { icon: '🔁', text: 'Loops repeat code without writing it multiple times' },
      { icon: '🔢', text: 'range(n) gives numbers 0 to n-1' },
      { icon: '🔄', text: 'while loops repeat while a condition is true' },
      { icon: '➕', text: 'Loops can accumulate values (like summing numbers)' },
    ],
  },

  m4: {
    slug: 'm4',
    title: 'Functions',
    gradeBand: '9-10',
    description: 'Learn to write reusable blocks of code with functions — like creating your own commands in Python.',
    icon: '⚙️',
    color: 'purple',
    xpReward: 140,
    prerequisites: ['m1', 'm2', 'm3'],
    stages: ['hook', 'visualizer', 'sandbox', 'tutor', 'quiz'],
    hookConfig: {
      analogy: 'recipe',
      emoji: '📋',
      steps: [
        { label: 'Write recipe once', delay: 0 },
        { label: 'Use it any time', delay: 2000 },
        { label: 'Change ingredients (parameters)', delay: 4000 },
      ],
      insight: "That's a function.",
      insightDetail:
        'A recipe is a set of steps you write once and use many times. A Python function works the same way — you define the steps once and call it whenever you need it.',
      mapping: [
        { left: 'Recipe name', right: 'def greet():' },
        { left: 'Ingredients (optional)', right: 'def greet(name):' },
        { left: 'Use the recipe', right: 'greet("Priya")' },
      ],
    },
    tutorPresetQuestions: [
      'What is the difference between def and calling a function?',
      'What does return do?',
      'Can a function call another function?',
    ],
    codeLines: [
      'def greet(name):         # step 1',
      '    message = "Hi " + name  # step 2',
      '    return message       # step 3',
      '                         # step 4',
      'result = greet("Priya") # step 5',
      'print(result)            # step 6',
    ],
    visualizerSteps: [
      { line: 0, vars: {}, output: '', explanation: 'def greet(name): defines a function. Python reads this but doesn\'t run it yet — it just saves the recipe.' },
      { line: 4, vars: { name: '"Priya"' }, output: '', explanation: 'Now we call greet("Priya"). Python jumps inside the function. name gets the value "Priya".' },
      { line: 1, vars: { name: '"Priya"', message: '"Hi Priya"' }, output: '', explanation: 'Inside the function: message = "Hi " + name = "Hi Priya".' },
      { line: 2, vars: { name: '"Priya"', message: '"Hi Priya"', return: '"Hi Priya"' }, output: '', explanation: 'return sends "Hi Priya" back to where the function was called.' },
      { line: 4, vars: { result: '"Hi Priya"' }, output: '', explanation: 'Back outside: result = the returned value = "Hi Priya".' },
      { line: 5, vars: { result: '"Hi Priya"' }, output: 'Hi Priya', explanation: 'print(result) shows "Hi Priya". Done!' },
    ],
    sandboxConfig: {
      starterCode: `def greet(name):\n    message = "Hi " + name\n    return message\n\nresult = greet("Priya")\nprint(result)`,
      challenge: 'Call greet() with your own name. Then add a second call with a friend\'s name.',
      successHint: '🎉 You just wrote AND used a function! This is how all large programs are built.',
      challenges: [
        {
          title: 'Call with Your Name',
          description: 'Change the function call to use your own name.',
          starterCode: `def greet(name):\n    message = "Hi " + name\n    return message\n\nresult = greet("Priya")\nprint(result)`,
          hint: 'Change "Priya" to your name inside the greet() call.',
          solution: `def greet(name):\n    message = "Hi " + name\n    return message\n\nresult = greet("Arjun")\nprint(result)`,
          successCheck: 'Hi',
        },
        {
          title: 'Add a square() Function',
          description: 'Write a function called square(n) that returns n multiplied by n.',
          starterCode: `def square(n):\n    # return n * n\n    return n * n\n\nprint(square(4))\nprint(square(7))`,
          hint: 'Multiplication in Python uses *. So n * n gives n squared.',
          solution: `def square(n):\n    return n * n\n\nprint(square(4))\nprint(square(7))`,
          successCheck: '16',
        },
        {
          title: 'Greet 3 Friends with a Loop',
          description: 'Use greet() inside a for loop to greet 3 friends.',
          starterCode: `def greet(name):\n    return "Hi " + name\n\nfriends = ["Priya", "Ravi", "Meena"]\nfor friend in friends:\n    print(greet(friend))`,
          hint: 'You can loop over a list of names. greet(friend) will be called once for each name.',
          solution: `def greet(name):\n    return "Hi " + name\n\nfriends = ["Priya", "Ravi", "Meena"]\nfor friend in friends:\n    print(greet(friend))`,
          successCheck: 'Hi Meena',
        },
      ],
    },
    quizQuestions: [
      { question: 'What does the "def" keyword do?', options: ['Runs a function immediately', 'Defines (creates) a function', 'Deletes a function', 'Displays a function'], correctIndex: 1, explanation: 'def is short for "define". It tells Python you are creating a new function.' },
      { question: 'In def greet(name), what is "name"?', options: ['The return value', 'A parameter (input) the function receives', 'A global variable', 'The function output'], correctIndex: 1, explanation: 'name is a parameter — it is the input the function receives when it is called.' },
      { question: 'What does "return" do inside a function?', options: ['Repeats the function', 'Sends a value back to where the function was called', 'Prints to the screen', 'Nothing'], correctIndex: 1, explanation: 'return sends (returns) a value from inside the function back to the code that called it.' },
      { question: 'If you define a function but never call it, what happens?', options: ['It runs automatically', 'Nothing — functions only run when called', 'It causes an error', 'Python deletes it'], correctIndex: 1, explanation: 'Defining a function just saves the recipe. It only runs when you explicitly call it by name.' },
      { question: 'How many times can you call the same function?', options: ['Only once', 'Only twice', 'As many times as you want', 'Only 10 times'], correctIndex: 2, explanation: 'That\'s the whole point of functions! You write the code once and call it as many times as you need.' },
    ],
    completionSummary: [
      { icon: '⚙️', text: 'def creates a reusable block of code' },
      { icon: '📥', text: 'Parameters pass data into functions' },
      { icon: '📤', text: 'return sends a value back out' },
      { icon: '♻️', text: 'Call a function as many times as you need' },
    ],
  },

  m5: {
    slug: 'm5',
    title: 'Lists & Data',
    gradeBand: '9-10',
    description: 'Store multiple values in one variable, loop through them, and understand how data is organized.',
    icon: '📋',
    color: 'teal',
    xpReward: 150,
    prerequisites: ['m1', 'm2', 'm3', 'm4'],
    stages: ['hook', 'visualizer', 'sandbox', 'tutor', 'quiz'],
    hookConfig: {
      analogy: 'tiffin box',
      emoji: '🍱',
      steps: [
        { label: 'Box holds multiple items', delay: 0 },
        { label: 'Access item by position', delay: 2000 },
        { label: 'Add or remove items', delay: 4000 },
      ],
      insight: "That's a list.",
      insightDetail:
        'A tiffin box holds multiple food items in one container. A Python list holds multiple values in one variable — and you can access each item by its position.',
      mapping: [
        { left: 'Tiffin box', right: 'students = [...]' },
        { left: 'First item', right: 'students[0]' },
        { left: 'Add an item', right: 'students.append("Ravi")' },
      ],
    },
    tutorPresetQuestions: [
      'Why does indexing start at 0?',
      'What is the difference between a list and a variable?',
      'How do I find the length of a list?',
    ],
    codeLines: [
      'students = ["Priya", "Ravi", "Meena"]  # step 1',
      'print(students[0])        # step 2',
      'students.append("Kumar")  # step 3',
      'for s in students:        # step 4',
      '    print(s)              # step 5',
    ],
    visualizerSteps: [
      { line: 0, vars: { students: '["Priya","Ravi","Meena"]' }, output: '', explanation: 'We create a list called students with 3 items. Lists use square brackets [].' },
      { line: 1, vars: { students: '["Priya","Ravi","Meena"]' }, output: 'Priya', explanation: 'students[0] accesses the FIRST item. Lists start counting from 0. So [0] = "Priya".' },
      { line: 2, vars: { students: '["Priya","Ravi","Meena","Kumar"]' }, output: 'Priya', explanation: 'append() adds "Kumar" to the end. The list now has 4 items.' },
      { line: 3, vars: { students: '["Priya","Ravi","Meena","Kumar"]', s: '"Priya"' }, output: 'Priya', explanation: 'A for loop goes through each item. s starts as "Priya".' },
      { line: 4, vars: { students: '["Priya","Ravi","Meena","Kumar"]', s: '"Kumar"' }, output: 'Priya\nRavi\nMeena\nKumar', explanation: 'After all 4 iterations, all 4 names are printed — the loop visited each item automatically.' },
    ],
    sandboxConfig: {
      starterCode: `students = ["Priya", "Ravi", "Meena"]\nprint(students[0])\nstudents.append("Kumar")\nfor s in students:\n    print(s)`,
      challenge: 'Add your own name to the list. Then print the length of the list using len().',
      successHint: '🎉 Lists are everywhere in programming — you just learned one of the most important data structures!',
      challenges: [
        {
          title: 'Add Your Name',
          description: 'Use append() to add your name to the students list, then print it.',
          starterCode: `students = ["Priya", "Ravi", "Meena"]\nstudents.append("YourName")\nprint(students)`,
          hint: 'Replace "YourName" inside append() with your actual name (keep the quotes).',
          solution: `students = ["Priya", "Ravi", "Meena"]\nstudents.append("Arjun")\nprint(students)`,
          successCheck: 'Arjun',
        },
        {
          title: 'Print Each Item with Its Number',
          description: 'Print each student with their number (1, 2, 3...). Use enumerate().',
          starterCode: `students = ["Priya", "Ravi", "Meena", "Kumar"]\nfor i, name in enumerate(students, 1):\n    print(i, name)`,
          hint: 'enumerate(students, 1) gives each item a number starting at 1.',
          solution: `students = ["Priya", "Ravi", "Meena", "Kumar"]\nfor i, name in enumerate(students, 1):\n    print(i, name)`,
          successCheck: '1 Priya',
        },
        {
          title: 'Find the Highest Score',
          description: 'Find the highest score in a list using max() and print it.',
          starterCode: `scores = [78, 92, 45, 88, 63]\nhighest = max(scores)\nprint("Highest score:", highest)`,
          hint: 'max() returns the largest number in a list. len() returns how many items.',
          solution: `scores = [78, 92, 45, 88, 63]\nhighest = max(scores)\nprint("Highest score:", highest)`,
          successCheck: 'Highest score: 92',
        },
      ],
    },
    quizQuestions: [
      { question: 'What does students[0] do?', options: ['Gets the last item in the list', 'Gets the first item in the list', 'Gets item number 0 starting from 1', 'Deletes the first item'], correctIndex: 1, explanation: 'Lists are zero-indexed — the first item is at position 0, the second at 1, and so on.' },
      { question: 'What does append() do?', options: ['Removes the last item', 'Adds a new item to the end of the list', 'Sorts the list', 'Returns the length'], correctIndex: 1, explanation: 'append() adds a new item to the end of a list.' },
      { question: 'If students = ["A","B","C"], what is len(students)?', options: ['2', '3', '4', '0'], correctIndex: 1, explanation: 'len() returns the number of items. The list has 3 items, so len(students) = 3.' },
      { question: 'How do you loop through every item in a list?', options: ['while list:', 'for item in list:', 'loop list:', 'repeat list:'], correctIndex: 1, explanation: '"for item in list:" is the standard way to loop through every item in a list, one at a time.' },
      { question: 'What is a list in Python?', options: ['A type of loop', 'A container that holds multiple values in order', 'A print function', 'A mathematical operation'], correctIndex: 1, explanation: 'A list is a collection that can hold multiple values in a specific order, all in one variable.' },
    ],
    completionSummary: [
      { icon: '📋', text: 'Lists store multiple values in one variable' },
      { icon: '0️⃣', text: 'Indexing starts at 0 (first item = list[0])' },
      { icon: '➕', text: 'append() adds items; len() gives the count' },
      { icon: '🔁', text: '"for item in list" visits every item automatically' },
    ],
  },
}

export const VALID_BATCH_CODES: Record<string, string> = {
  PILOT1: 'EduAI NGO Pilot — Batch 1',
  PILOT2: 'EduAI NGO Pilot — Batch 2',
  DEMO01: 'EduAI Demo Batch',
  CLASS9: 'EduAI Class 9 — Coimbatore',
  CLASS10: 'EduAI Class 10 — Coimbatore',
}

export const STAGES_INFO = [
  { key: 'hook', label: 'Concept', icon: '💡' },
  { key: 'visualizer', label: 'Visualizer', icon: '🔍' },
  { key: 'sandbox', label: 'Try it', icon: '⌨️' },
  { key: 'tutor', label: 'AI Tutor', icon: '🤖' },
  { key: 'quiz', label: 'Quiz', icon: '✅' },
]

export const MODULE_ORDER = ['m1', 'm2', 'm3', 'm4', 'm5']

export const COLOR_MAP: Record<string, Record<string, string>> = {
  amber: {
    badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    icon: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    glow: 'shadow-amber-500/20',
    progress: 'bg-amber-400',
    ring: 'ring-amber-400/30',
    card: 'hover:border-amber-500/30',
  },
  blue: {
    badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    icon: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    glow: 'shadow-blue-500/20',
    progress: 'bg-blue-400',
    ring: 'ring-blue-400/30',
    card: 'hover:border-blue-500/30',
  },
  green: {
    badge: 'bg-green-500/10 border-green-500/20 text-green-400',
    icon: 'bg-green-500/20 text-green-400 border-green-500/30',
    glow: 'shadow-green-500/20',
    progress: 'bg-green-400',
    ring: 'ring-green-400/30',
    card: 'hover:border-green-500/30',
  },
  purple: {
    badge: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    icon: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    glow: 'shadow-purple-500/20',
    progress: 'bg-purple-400',
    ring: 'ring-purple-400/30',
    card: 'hover:border-purple-500/30',
  },
  teal: {
    badge: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
    icon: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    glow: 'shadow-teal-500/20',
    progress: 'bg-teal-400',
    ring: 'ring-teal-400/30',
    card: 'hover:border-teal-500/30',
  },
}
