<li class="relative">
    {{-- This optional span creates a horizontal connector line for a tree view --}}
    @if($tag->parent_id)
        <span class="absolute -left-[9px] top-5 -mt-px h-px w-5 bg-gray-200" aria-hidden="true"></span>
    @endif

    {{-- Main tag item row --}}
    <div class="relative flex flex-col p-2 space-y-2 bg-gray-50 rounded-md">
        <div class="flex items-center justify-between">
            @if ($editingTagId === $tag->id)
                {{-- EDITING STATE --}}
                <form wire:submit.prevent="update" class="flex items-center justify-between w-full">
                    <div class="flex-grow">
                        <input type="text" wire:model="editingTagName" class="w-full rounded-md border-gray-300 shadow-sm" autofocus>
                    </div>
                    <div class="flex items-center space-x-2 ml-4">
                        <button type="submit" class="text-green-600 font-semibold">Save</button>
                        <button type="button" wire:click="cancelEditing" class="text-gray-500">Cancel</button>
                    </div>
                </form>
            @else
                {{-- DISPLAY STATE --}}
                <div class="flex items-center justify-between w-full">
                    <span class="font-medium">{{ $tag->name }}</span>
                    <div class="flex items-center space-x-2 ml-4">
                        <button wire:click.prevent="startSharing({{ $tag->id }})" class="text-sm text-green-600 hover:text-green-800 font-semibold">Share</button>
                        <button wire:click.prevent="startAddingSubTag({{ $tag->id }})" class="text-sm text-gray-500 hover:text-gray-700 font-semibold">Add</button>
                        <button wire:click.prevent="startEditing({{ $tag->id }}, '{{ $tag->name }}')" class="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                        <button wire:click.prevent="delete({{ $tag->id }})" wire:confirm="Are you sure?" class="text-sm text-red-600 hover:text-red-800">Delete</button>
                    </div>
                </div>
            @endif
        </div>

        {{-- Form for sharing a tag --}}
        @if($sharingTagId === $tag->id)
            <div class="p-3 bg-white rounded-md border">
                <h4 class="font-semibold text-sm mb-2">Share '{{ $tag->name }}'</h4>
                <form wire:submit.prevent="shareTag" class="space-y-2">
                    <div>
                        <input type="email" wire:model="shareWithEmail" placeholder="user@example.com" class="w-full text-sm rounded-md border-gray-300">
                        @error('shareWithEmail') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>
                    <div class="flex items-center justify-between">
                        <select wire:model="permissionLevel" class="text-sm rounded-md border-gray-300">
                            <option value="view">Can View</option>
                            <option value="edit">Can Edit</option>
                        </select>
                        <div class="flex items-center space-x-2">
                            {{-- NEW: Cancel button added here --}}
                            <button type="button" wire:click.prevent="cancelSharing" class="text-sm text-gray-600">Cancel</button>
                            <button type="submit" class="text-sm px-3 py-1 bg-green-500 text-white rounded-md">Confirm Share</button>
                        </div>
                    </div>
                </form>
            </div>
        @endif
        
        {{-- List of current shares --}}
        @if($tag->shares->isNotEmpty())
            <div class="pt-2 border-t">
                <h4 class="font-medium text-xs text-gray-500 uppercase">Shared With:</h4>
                <ul class="mt-1 space-y-1">
                    @foreach($tag->shares as $share)
                        <li class="flex items-center justify-between text-sm">
                            <span>{{ $share->user->name }} ({{ $share->permission_level }})</span>
                            <button wire:click="revokeShare({{ $share->id }})" class="text-xs text-red-500 hover:underline">Revoke</button>
                        </li>
                    @endforeach
                </ul>
            </div>
        @endif
    </div>

    {{-- Form for adding a sub-tag --}}
    @if($addingSubTagToId === $tag->id)
        <div class="relative pl-8 pt-2">
            <span class="absolute -left-[9px] top-6 -mt-px h-px w-5 bg-gray-200" aria-hidden="true"></span>
            <form wire:submit.prevent="saveSubTag" class="flex items-center">
                <input type="text" wire:model="newSubTagName" placeholder="New sub-tag name..." class="flex-grow text-sm rounded-l-md border-gray-300 shadow-sm">
                <button type="submit" class="px-3 py-1 bg-gray-600 text-white text-sm font-semibold rounded-r-md hover:bg-gray-700">Save</button>
            </form>
        </div>
    @endif

    {{-- Recursive inclusion for children --}}
    @if($tag->children->isNotEmpty())
        <ul class="relative mt-2 pl-8 space-y-2 border-l-2 border-gray-200">
            <span class="absolute -left-px top-0 h-4 w-px bg-white" aria-hidden="true"></span>
            @foreach($tag->children as $child)
                @include('livewire._tag-item', ['tag' => $child])
            @endforeach
        </ul>
    @endif
</li>