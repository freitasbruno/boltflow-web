<x-dialog-modal wire:model.live="isModalOpen">
    <x-slot name="title">
        {{ $taskId ? 'Edit Task' : 'Create New Task' }}
    </x-slot>

    <x-slot name="content">
        <div class="space-y-4">
            <div>
                <x-label for="title" value="{{ __('Title') }}" />
                <x-input id="title" type="text" class="mt-1 block w-full" wire:model="title" />
                <x-input-error for="title" class="mt-2" />
            </div>

            <div>
                <x-label for="description" value="{{ __('Description (Optional)') }}" />
                <textarea wire:model="description" id="description" rows="3" class="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"></textarea>
                <x-input-error for="description" class="mt-2" />
            </div>
            
            <div>
                <x-label for="priority" value="{{ __('Priority') }}" />
                <select wire:model="priority" id="priority" class="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full">
                    <option value="1">1 (Lowest)</option>
                    <option value="2">2</option>
                    <option value="3">3 (Normal)</option>
                    <option value="4">4</option>
                    <option value="5">5 (Highest)</option>
                </select>
            </div>
        </div>
    </x-slot>

    <x-slot name="footer">
        <x-secondary-button wire:click="closeModal" wire:loading.attr="disabled">
            {{ __('Cancel') }}
        </x-secondary-button>

        <x-button class="ms-3" wire:click="save" wire:loading.attr="disabled">
            {{ __('Save') }}
        </x-button>
    </x-slot>
</x-dialog-modal>