<?php

namespace App\Livewire;

use App\Models\Tag;
use App\Models\User;
use App\Models\SharedTag;
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

    // --- PROPERTIES FOR SHARING ---
    public ?int $sharingTagId = null;
    #[Rule('required|email|exists:users,email')]
    public string $shareWithEmail = '';
    #[Rule('required|in:view,edit')]
    public string $permissionLevel = 'view';

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

    // --- METHODS FOR SHARING ---
    public function startSharing(int $tagId): void
    {
        $this->sharingTagId = $tagId;
        $this->reset('shareWithEmail', 'permissionLevel');
    }

    public function cancelSharing(): void
    {
        $this->sharingTagId = null;
    }
    
    public function shareTag(): void
    {
        $this->validate([
            'shareWithEmail' => 'required|email|exists:users,email',
            'permissionLevel' => 'required|in:view,edit',
        ]);

        $tag = Tag::findOrFail($this->sharingTagId);
        $this->authorize('update', $tag); // Only owner can share

        $userToShareWith = User::where('email', $this->shareWithEmail)->first();

        if ($userToShareWith->id === auth()->id()) {
            $this->addError('shareWithEmail', 'You cannot share a tag with yourself.');
            return;
        }

        SharedTag::create([
            'tag_id' => $tag->id,
            'user_id' => $userToShareWith->id,
            'permission_level' => $this->permissionLevel,
        ]);
        
        // Reset state and reload tags to show the new share
        $this->sharingTagId = null;
        $this->loadTags();
    }
    
    public function revokeShare(int $shareId): void
    {
        $share = SharedTag::findOrFail($shareId);
        // Authorize that the current user owns the parent tag
        $this->authorize('update', $share->tag);

        $share->delete();
        $this->loadTags(); // Reload tags to reflect the revoked share
    }
    // --- END OF METHODS FOR SHARING ---
    
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
