module.exports = {
  theme: {
  extend: {
    animation: {
      blob: "blob 20s infinite ease-in-out",
      gradient: "gradient 8s ease infinite",
    },
    keyframes: {
      blob: {
        "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
        "33%": { transform: "translate(30px, -50px) scale(1.1)" },
        "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
      },
      gradient: {
        "0%": { backgroundPosition: "0% 50%" },
        "50%": { backgroundPosition: "100% 50%" },
        "100%": { backgroundPosition: "0% 50%" },
      },
    },
    backgroundSize: {
      "300%": "300%",
    },
  },
},
}