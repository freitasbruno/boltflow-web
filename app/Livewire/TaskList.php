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
        $userId = auth()->id();

        // Get the IDs of all tags shared with the current user
        $sharedTagIds = auth()->user()->sharedWithMe()->pluck('tag_id');

        // The new query finds items the user owns OR items tagged with a shared tag
        $tasks = Item::query()
            ->where('type', 'task')
            ->with(['task', 'tags', 'user']) // Eager load the item's owner
            ->where(function ($query) use ($userId, $sharedTagIds) {
                // Condition 1: The user owns the item
                $query->where('user_id', $userId)
                      // Condition 2: Or the item is tagged with a shared tag
                      ->orWhereHas('tags', function ($subQuery) use ($sharedTagIds) {
                          $subQuery->whereIn('tags.id', $sharedTagIds);
                      });
            })
            ->latest()
            ->paginate(10);

        return view('livewire.task-list', [
            'tasks' => $tasks,
        ]);
    }
}