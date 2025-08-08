<li>
    {{-- Main tag item row --}}
    <div class="flex items-center justify-between p-2 bg-gray-100 rounded-md">
        @if ($editingTagId === $tag->id)
            {{-- EDITING STATE --}}
            <form wire:submit.prevent="update" class="flex items-center justify-between w-full">
                <div class="flex-grow">
                    <input type="text" wire:model="editingTagName" class="w-full rounded-md border-gray-300 shadow-sm" autofocus>
                </div>
                <div class="flex items-center space-x-2 ml-4">
                    <button type="submit" class="text-green-600 font-semibold">Save</button>
                    <button wire:click.prevent="cancelEditing" type="button" class="text-gray-500">Cancel</button>
                </div>
            </form>
        @else
            {{-- DISPLAY STATE --}}
            <div class="flex items-center justify-between w-full">
                <span class="font-medium">{{ $tag->name }}</span>
                <div class="flex items-center space-x-2 ml-4">
                    <button wire:click.prevent="startAddingSubTag({{ $tag->id }})" class="text-gray-500 hover:text-gray-700 text-sm font-semibold">Add</button>
                    <button wire:click.prevent="startEditing({{ $tag->id }}, '{{ $tag->name }}')" class="text-blue-600">Edit</button>
                    <button wire:click.prevent="delete({{ $tag->id }})" wire:confirm="Are you sure?" class="text-red-600">Delete</button>
                </div>
            </div>
        @endif
    </div>

    {{-- Form for adding a sub-tag --}}
    @if($addingSubTagToId === $tag->id)
    <div class="pl-8 pt-2">
        <form wire:submit.prevent="saveSubTag" class="flex items-center">
            <input type="text" wire:model="newSubTagName" placeholder="New sub-tag name..." class="flex-grow text-sm rounded-l-md border-gray-300 shadow-sm">
            <button type="submit" class="px-3 py-1 bg-gray-600 text-white text-sm font-semibold rounded-r-md hover:bg-gray-700">Save</button>
        </form>
    </div>
    @endif

    {{-- Recursive inclusion for children --}}
    @if($tag->children->isNotEmpty())
        {{-- The border classes have been removed, but pl-8 (padding-left) is kept for indentation --}}
        <ul class="mt-2 pl-8 space-y-2">
            @foreach($tag->children as $child)
                @include('livewire._tag-item', ['tag' => $child, 'editingTagId' => $editingTagId, 'addingSubTagToId' => $addingSubTagToId])
            @endforeach
        </ul>
    @endif
</li>