<?php

namespace App\Livewire;

use App\Models\Item;
use App\Models\Task;
use Illuminate\Support\Facades\DB;
use Livewire\Attributes\On;
use Livewire\Attributes\Rule;
use Livewire\Component;

class TaskForm extends Component
{
    public bool $isModalOpen = false;
    
    public ?int $taskId = null;

    #[Rule('required|string|max:255')]
    public string $title = '';

    #[Rule('nullable|string')]
    public string $description = '';

    #[Rule('required|in:1,2,3,4,5')]
    public int $priority = 3;

    #[On('create-task')]
    public function create(): void
    {
        $this->reset();
        $this->isModalOpen = true;
    }

    #[On('edit-task')]
    public function edit(int $itemId): void
    {
        $item = Item::with('task')->findOrFail($itemId);
        $this->authorize('update', $item);
        
        $this->taskId = $item->id;
        $this->title = $item->title;
        $this->description = $item->description;
        $this->priority = $item->task->priority;

        $this->isModalOpen = true;
    }

    public function save(): void
    {
        $this->validate();

        DB::transaction(function () {
            if ($this->taskId) {
                // UPDATE
                $item = Item::findOrFail($this->taskId);
                $this->authorize('update', $item);

                $item->update([
                    'title' => $this->title,
                    'description' => $this->description,
                ]);

                $item->task->update([
                    'priority' => $this->priority,
                ]);
            } else {
                // CREATE
                $item = auth()->user()->items()->create([
                    'type' => 'task',
                    'title' => $this->title,
                    'description' => $this->description,
                ]);

                $item->task()->create([
                    'priority' => $this->priority,
                ]);
            }
        });

        $this->closeModal();
        $this->dispatch('task-saved'); // Notify the list to refresh
    }

    public function closeModal(): void
    {
        $this->isModalOpen = false;
        $this->reset();
    }

    public function render()
    {
        return view('livewire.task-form');
    }
}