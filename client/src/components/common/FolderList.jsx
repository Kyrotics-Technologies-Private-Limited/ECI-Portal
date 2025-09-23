import { FolderIcon, GridIcon, ListIcon } from "lucide-react";
import { useState } from "react";

export const FolderList = ({ folders = [], onFolderClick }) => {
  const [isGridView, setIsGridView] = useState(true);

  return (
    <div>
      {folders.length > 0 && (
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => setIsGridView(true)}
            className={`p-2 rounded-lg ${
              isGridView ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100"
            }`}
          >
            <GridIcon size={20} />
          </button>
          <button
            onClick={() => setIsGridView(false)}
            className={`p-2 rounded-lg ${
              !isGridView
                ? "bg-indigo-100 text-indigo-600"
                : "hover:bg-gray-100"
            }`}
          >
            <ListIcon size={20} />
          </button>
        </div>
      )}

      <div
        className={
          isGridView
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            : "flex flex-col gap-2"
        }
      >
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => onFolderClick(folder)}
            className={`
                ${
                  isGridView
                    ? "flex flex-col items-center p-4"
                    : "flex flex-row items-center p-3 gap-3"
                }
                rounded-xl bg-indigo-100/50 backdrop-blur-sm border border-white/20
                hover:bg-white/20 hover:shadow-md transition-shadow cursor-pointer
              `}
          >
            <FolderIcon size={isGridView ? 40 : 24} className="text-blue-600" />
            <h3
              className={`${
                isGridView ? "mt-3" : "mt-0"
              } text-lg font-semibold text-black`}
            >
              {folder.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};
