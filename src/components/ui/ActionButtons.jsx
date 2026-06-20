import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function ActionButtons({ 
  onEdit, 
  onDelete, 
  editIcon: EditIcon = Edit, 
  deleteIcon: DeleteIcon = Trash2 
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      {onEdit && (
        <button 
          onClick={onEdit}
          className="p-1.5 text-monday-gray hover:text-monday-blue hover:bg-monday-blue/10 rounded-xl transition-300"
        >
          <EditIcon size={16} />
        </button>
      )}
      {onDelete && (
        <button 
          onClick={onDelete}
          className="p-1.5 text-monday-gray hover:text-monday-red hover:bg-monday-red/10 rounded-xl transition-300"
        >
          <DeleteIcon size={16} />
        </button>
      )}
    </div>
  );
}
