<?php

namespace App\Livewire;

use App\Models\Item;
use App\Models\Task;
use Livewire\Component;
use Livewire\WithPagination;
use Livewire\Attributes\On;

class TaskList extends Component
{
    use WithPagination;

    // The editing properties and methods have been removed.

    public function delete(int $itemId): void
    {
        $item = Item::findOrFail($itemId);
        $this->authorize('delete', $item);
        
        $item->delete();
    }

    public function toggleCompleted(int $taskId): void
    {
        $task = Task::findOrFail($taskId);
        $this->authorize('update', $task);

        $task->update([
            'status' => $task->status === 'completed' ? 'pending' : 'completed',
        ]);
    }

    #[On('task-saved')] // Listens for the event from the form
    public function render()
    {
        $tasks = auth()->user()
            ->items()
            ->where('type', 'task')
            ->with('task', 'tags')
            ->latest()
            ->paginate(10);

        return view('livewire.task-list', [
            'tasks' => $tasks,
        ]);
    }
}