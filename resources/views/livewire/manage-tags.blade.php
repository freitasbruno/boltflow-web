<div>
    <div class="p-6 bg-white rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">Manage Tags</h2>

        <form wire:submit.prevent="save" class="mb-6">
            <div class="flex items-center">
                <input type="text" wire:model="name" placeholder="My new tag..." class="flex-grow rounded-l-md border-gray-300 shadow-sm">
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-r-md hover:bg-indigo-700">Add Tag</button>
            </div>
            @error('name') <span class="text-red-500 text-sm mt-1">{{ $message }}</span> @enderror
        </form>

        <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Existing Tags</h3>
            <ul class="space-y-2">
                @forelse ($tags as $tag)
                    {{-- Include the partial for each top-level tag --}}
                    @include('livewire._tag-item', ['tag' => $tag])
                @empty
                    <li class="text-gray-500">You don't have any tags yet.</li>
                @endforelse
            </ul>
        </div>
    </div>
</div>