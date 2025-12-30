const NewChatScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center  text-gray-200">
      <h1 className="text-4xl font-bold mb-4 leading-13">
        Welcome <br />
        to <br /> <span className="text-emerald-500">Prosperity Agent</span>
      </h1>
      <p className="text-lg max-w-xl">
        Ask me anything tech, code, AI, or roast-worthy — I'm your AI buddy 😊
      </p>
      <div className="mt-6 text-sm opacity-60">
        <p>Try: "Build me a MERN project idea"</p>
        <p>Or: "What's the difference between AI and ML?"</p>
      </div>
    </div>
  );
};

export default NewChatScreen;
