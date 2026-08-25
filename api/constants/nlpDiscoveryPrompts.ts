// constants/nlpDiscoveryPrompts.ts
export const NLP_DISCOVERY_PROMPTS = [
  {
    screen: 1,
    isCompulsory: true,
    title: "Let's start with you 👋",
    subtitle: "Forget careers for a second. What do you genuinely enjoy doing?",
    hint: "Gaming? Drawing? Fixing things? Helping friends? Making videos? Debating? Solving random problems?",
    placeholder: "Tell us about yourself...",
    maxLength: 500
  },
  {
    screen: 2,
    isCompulsory: false,
    title: "Okay, we’re getting somewhere 👀",
    subtitle: "Imagine you could spend an entire day doing something you actually enjoy. What would you be doing?",
    hint: "Don't overthink it. There are no wrong answers.",
    placeholder: "I’d probably...",
    maxLength: 500
  },
  {
    screen: 3,
    isCompulsory: false,
    title: "Now let's talk about your superpower ⚡",
    subtitle: "What do people usually come to you for?",
    hint: "Maybe you're the person who explains things, fixes problems, comes up with ideas, organizes everyone, listens when people need help, or figures things out.",
    placeholder: "People usually say I'm good at...",
    maxLength: 500
  }
];