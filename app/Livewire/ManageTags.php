<?php

namespace App\Livewire;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Collection;
use Livewire\Attributes\Rule;
use Livewire\Component;

class ManageTags extends Component
{
    /**
     * The new tag's name.
     */
    #[Rule('required|string|min:3|max:50')]
    public string $name = '';

    /**
     * The collection of existing tags.
     * @var Collection
     */
    public Collection $tags;

    /**
     * Mount the component and load initial data.
     */
    public function mount(): void
    {
        $this->loadTags();
    }

    /**
     * Save a new tag to the database.
     */
    public function save(): void
    {
        $this->validate();

        auth()->user()->tags()->create([
            'name' => $this->name,
        ]);

        $this->reset('name'); // Clear the input field
        $this->loadTags(); // Refresh the list of tags
    }

    /**
     * Helper method to load tags from the database.
     */
    public function loadTags(): void
    {
        // We only load top-level tags for now (where parent_id is null)
        $this->tags = auth()->user()->tags()->whereNull('parent_id')->get();
    }

    /**
     * Render the component's view.
     */
    public function render()
    {
        return view('livewire.manage-tags');
    }
}
