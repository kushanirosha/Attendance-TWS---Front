export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-300 border-t border-gray-500 py-3 px-6 text-center text-sm text-gray-600 z-20">
      <div>
        © {currentYear}  All Rights Reserved.  TWS - IT
      </div>
      {/* <div className="font-medium text-gray-800">
        TWS - IT
      </div> */}
    </footer>
  );
};