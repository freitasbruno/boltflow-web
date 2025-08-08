<?php

namespace App\Livewire;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Livewire\Attributes\Rule;
use Livewire\Component;
use Livewire\Attributes\On;

class ManageTags extends Component
{
    #[Rule('required|string|min:3|max:50')]
    public string $name = '';

    public Collection $tags;

    public ?int $editingTagId = null;
    
    // --- PROPERTIES FOR EDITING ---
    #[Rule('required|string|min:3|max:50')]
    public string $editingTagName = '';

    // --- PROPERTIES FOR SUBTAGS ---
    public ?int $addingSubTagToId = null;
    #[Rule('required|string|min:3|max:50')]
    public string $newSubTagName = '';

    public function mount(): void
    {
        $this->loadTags();
    }

    public function save(): void
    {
        $this->validateOnly('name');

        auth()->user()->tags()->create([
            'name' => $this->name,
        ]);

        $this->reset('name');
        $this->loadTags();
    }

    // --- METHODS FOR SUB-TAGS ---
    public function startAddingSubTag(int $tagId): void
    {
        $this->addingSubTagToId = $tagId;
        $this->newSubTagName = '';
    }

    public function cancelAddingSubTag(): void
    {
        $this->reset('addingSubTagToId', 'newSubTagName');
    }

    public function saveSubTag(): void
    {
        $this->validateOnly('newSubTagName');

        $parentTag = Tag::findOrFail($this->addingSubTagToId);
        $this->authorize('update', $parentTag);

        auth()->user()->tags()->create([
            'parent_id' => $this->addingSubTagToId,
            'name' => $this->newSubTagName,
        ]);

        $this->cancelAddingSubTag();
        $this->loadTags();
    }

    // --- METHODS FOR EDITING ---
    public function startEditing(int $tagId, string $tagName): void
    {
        $this->editingTagId = $tagId;
        $this->editingTagName = $tagName;
    }

    #[On('cancel-editing')]
    public function cancelEditing(): void
    {
        $this->reset('editingTagId', 'editingTagName');
    }

    public function update(): void
    {
        $this->validateOnly('editingTagName');

        $tag = Tag::findOrFail($this->editingTagId);
        $this->authorize('update', $tag); // Optional but good practice

        $tag->update([
            'name' => $this->editingTagName,
        ]);

        $this->cancelEditing();
        $this->loadTags();
    }

    // --- METHOD FOR DELETING ---
    public function delete(int $tagId): void
    {
        $tag = Tag::findOrFail($tagId);
        $this->authorize('delete', $tag); // Optional but good practice

        $tag->delete();
        $this->loadTags();
    }
    // -------------------------------

    public function loadTags(): void
    {
        $this->tags = auth()->user()
            ->tags()
            ->whereNull('parent_id')
            ->with('children') // Eager load the children relationship
            ->get();
    }

    public function render()
    {
        return view('livewire.manage-tags');
    }
}
