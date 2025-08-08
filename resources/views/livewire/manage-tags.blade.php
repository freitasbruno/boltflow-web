<div>
    <div class="p-6 bg-white rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">Manage Tags</h2>

        <form wire:submit="save" class="mb-6">
            <div class="flex items-center">
                <input
                    type="text"
                    wire:model="name"
                    placeholder="New tag name"
                    class="flex-grow rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                <button
                    type="submit"
                    class="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Add Tag
                </button>
            </div>
            @error('name') <span class="text-red-500 text-sm mt-1">{{ $message }}</span> @enderror
        </form>

        <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Existing Tags</h3>
            <ul class="space-y-2">
                @forelse ($tags as $tag)
                    <li class="px-4 py-2 bg-gray-100 rounded-md">{{ $tag->name }}</li>
                @empty
                    <li class="text-gray-500">You don't have any tags yet.</li>
                @endforelse
            </ul>
        </div>
    </div>
</div>
