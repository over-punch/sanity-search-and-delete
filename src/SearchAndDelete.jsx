// Search and delete component for managing Sanity documents
import { Stack, Grid, Heading, Text, Button, TextInput, Select } from '@sanity/ui'
import { TrashIcon, LockIcon, UnlockIcon, CollapseIcon, ExpandIcon } from '@sanity/icons'
import { useState, useEffect } from 'react'
import DangerModeWarning, { shouldShowDangerWarning } from './DangerModeWarning'

/**
 * Search and Delete Component
 * Allows searching for and deleting Sanity documents by type and title
 * @param {Object} props - Component props
 * @param {SanityClient} props.client - Sanity client instance
 */
const SearchAndDelete = (props) => {
	// Props
	const {client, icon: Icon, displayName, dangerMode, utilityId, onDangerModeChange} = props;

	// State
	const [deleteValue, setDeleteValue] = useState(''); // Search input value
	const [deletable, setDeletable] = useState([]); // Matching documents
	const [deletableMessage, setDeletableMessage] = useState(''); // Status/error messages
	const [deleteType, setDeleteType] = useState('typeface'); // Document type to search
	const [excludeValue, setExcludeValue] = useState('');
	const [exclude, setExclude] = useState(false);
	const [showWarningModal, setShowWarningModal] = useState(false);

	/**
	 * Handle danger mode toggle with warning modal
	 */
	const handleDangerModeToggle = () => {
		if (!dangerMode && shouldShowDangerWarning()) {
			// Trying to enable danger mode, show warning
			setShowWarningModal(true);
		} else {
			// Either disabling danger mode or warning is suppressed
			onDangerModeChange(utilityId, !dangerMode);
		}
	};

	const handleWarningConfirm = () => {
		setShowWarningModal(false);
		onDangerModeChange(utilityId, true);
	};

	const handleWarningCancel = () => {
		setShowWarningModal(false);
	};

	useEffect(() => {
		if (!exclude) setExcludeValue("");
	}, [exclude]);

	/**
	 * Search for documents matching the input value
	 * @param {string} value - Search term to match against document titles
	 */
	async function searchFor(value) {
		const items = await client.fetch(`
			*[
				_type == "${deleteType}"
				&& title match "${value}*"
				${excludeValue !== "" ? ` && !(title match "*${excludeValue}*")` : ""}
			]
		`)
		setDeletable(items)
	}

	// Update search results when input or type changes
	useEffect(() => {
		searchFor(deleteValue)
	}, [deleteValue, deleteType, excludeValue])

	/**
	 * Delete all documents matching the current search criteria
	 */
	function deleteItems(){
		const confirmed = window.confirm(`Are you sure you want to delete ${deletable.length} ${deleteType} document${deletable.length !== 1 ? 's' : ''}?`);

		if (!confirmed) return;

		client
			.delete({query: `
				*[
					_type == "${deleteType}"
					&& title match "${deleteValue}*"
					${excludeValue !== "" ? ` && !(title match "*${excludeValue}*")` : ""}
				]
			`})
			.then(()=>{
				setDeletableMessage("Deleted!");
				searchFor(deleteValue);
				setTimeout(()=>{
					setDeletableMessage("");
					setDeleteValue("");
				}, 2000)
			})
			.catch(async(err)=>{
				console.error(err);
				let documentFromError = err.message.match(/references to it from "(.*?)"/);
				documentFromError = documentFromError[0];
				documentFromError = documentFromError.replace('references to it from "', '').replace('"', '');
				let messageLink = !documentFromError ? "" : `<br/><br/>
					Search for <a target="_blank" href="${window.location.origin}/desk/${deleteType};${documentFromError}">${documentFromError}</a> in the search bar above.
				`
				setDeletableMessage(err.message + messageLink);
			})
	}

	return (
		<>
			<DangerModeWarning
				isOpen={showWarningModal}
				onConfirm={handleWarningConfirm}
				onCancel={handleWarningCancel}
				utilityName={displayName}
			/>

			<Stack style={{paddingTop: "4em", paddingBottom: "2em", position: "relative"}}>
				<Heading as="h3" size={3}>{Icon && <Icon style={{display: 'inline-block', marginRight: '0.35em', opacity: 0.5, transform: 'translateY(2px)'}} />}{displayName}</Heading>
				<Text muted size={1} style={{paddingTop: "2em", maxWidth: "calc(100% - 100px)"}}>
					Find documents by name and type, then delete them in bulk. Enable danger mode to unlock delete functionality. Handles reference conflicts gracefully.
				</Text>
				<div style={{position: "absolute", bottom: "1.5em", right: "0"}}>
					<Button
						mode={exclude?"ghost":"bleed"}
						tone="positive"
						icon={exclude?CollapseIcon:ExpandIcon}
						onClick={() => { setExclude(!exclude) }}
						style={{cursor: "pointer", marginLeft: ".5em"}}
					/>
					<Button
						mode={dangerMode?"ghost":"bleed"}
						tone="critical"
						icon={dangerMode?UnlockIcon:LockIcon}
						onClick={handleDangerModeToggle}
						style={{cursor: "pointer", marginLeft: ".5em"}}
					/>
				</div>
			</Stack>

			<Stack style={{ position: "relative" }} >
				<Grid columns={exclude ? [3] : [2]} gap={0}
					style={{
						position: "relative",
						width: (deleteValue !== "" && deletable.length && dangerMode) ? "calc(100% - 3rem - 5px)" :  "",
					}}
				>
					<TextInput
						style={{
							borderRadius: "3px 0 0 0",
						}}
						onChange={(event) => { setDeleteValue(event.currentTarget.value) }}
						placeholder="Name"
						value={deleteValue}
					/>
					{!!exclude &&
						<TextInput
							style={{
								display: exclude ? "" : "none",
							}}
							onChange={(event) => { setExcludeValue(event.currentTarget.value) }}
							placeholder="Excluding"
							value={excludeValue}
						/>
					}
					<Select
						style={{
							borderRadius: "0 3px 0 0",
						}}
						onChange={(event) => { setDeleteType(event.currentTarget.value) }}
						value={deleteType}
					>
						<option value="typeface">Typeface</option>
						<option value="collection">Collection</option>
						<option value="pair">Pair</option>
						<option value="font">Font</option>
						<option value="license">License</option>
						<option value="order">Order</option>
						<option value="account">Account</option>
						<option value="cart">Cart</option>
						<option value="page">Page</option>
						<option value="blogpost">Blogpost</option>
					</Select>
				</Grid>
				{(deleteValue !== "" && deletable.length && dangerMode) ? (
					<Button
						flex={1} icon={TrashIcon} tone="critical"
						style={{
							position: "absolute",
							right: "0",
							width: "3rem",
						}}
						onClick={() => { deleteItems() }}
					/>
				) : ''}
			</Stack>

			{deletableMessage!="" && (
				<Stack>
					<p style={{padding: ".5em 0em 1em", opacity: "0.75"}} dangerouslySetInnerHTML={{__html: deletableMessage}}></p>
				</Stack>
			)}

			{deletable.length > 0 && (
				<>
					<div
						style={{
							maxHeight: "400px",
							marginTop: "5px",
							border: "1px solid rgba(255,255,255,0.1)",
							overflow: "auto",
							paddingBottom: "1rem",
							borderRadius: "3px",
						}}
					>
						{deletable.map((item, index) => (
							<a
								target="_blank"
								key={`item-${index}`}
								className="link"
								href={`${window.location.origin}/desk/${(deleteType === "typeface" || deleteType === "licenseGroup") ? "orderable-" : ""}${deleteType};${item._id}`}
							>
								<Stack>
									<Text size={1} style={{padding: "1em 1em .5em"}}>{item.title}</Text>
								</Stack>
							</a>
						))}
					</div>
					<div style={{pointerEvents: "none", textAlign: "right", top: "-30px", paddingRight: "10px", position: "relative", height: "30px"}}>{deletable.length} items</div>
				</>
			)}
		</>
	)
}

export default SearchAndDelete
