import fs from 'fs';
import path from 'path';

const postmanFile = './MowdminMobileBE.postman_collection.json';
const data = JSON.parse(fs.readFileSync(postmanFile, 'utf8'));

// Helper to create a basic request object
function createRequest(folderName, name, method, urlPath, bodyData = null) {
    const req = {
        name: name,
        request: {
            method: method,
            header: [
                { "key": "Authorization", "value": "Bearer {{authToken}}", "type": "text" }
            ],
            url: {
                raw: `{{base_url}}/api/v1/${urlPath}`,
                host: ["{{base_url}}"],
                path: ["api", "v1", ...urlPath.split('/').filter(p => p && p !== 'api' && p !== 'v1')]
            }
        }
    };

    if (bodyData) {
        req.request.body = {
            mode: "formdata",
            formdata: Object.entries(bodyData).map(([key, value]) => ({
                key,
                value: typeof value === 'boolean' ? value.toString() : value,
                type: "text"
            }))
        };
    }

    return req;
}

// 1. Recursive function to fix paths (add 'v1', fix 'order' -> 'orders')
function fixItem(item) {
    if (item.request && item.request.url) {
        let pathArray = item.request.url.path;
        if (!pathArray) return;

        // Ensure 'v1' is present after 'api'
        const apiIndex = pathArray.indexOf("api");
        if (apiIndex !== -1 && pathArray[apiIndex + 1] !== "v1") {
            pathArray.splice(apiIndex + 1, 0, "v1");
        }

        // Fix 'order' -> 'orders' specifically (but handle singular/plural carefully)
        // Code uses /api/v1/orders. Old Postman had /api/order.
        // Order Item uses /api/v1/order-item.
        const orderIndex = pathArray.indexOf("order");
        if (orderIndex !== -1) {
            pathArray[orderIndex] = "orders";
        }

        // Reconstruct raw URL
        item.request.url.path = pathArray;
        item.request.url.raw = `{{base_url}}/${pathArray.join('/')}`;
    }

    if (item.item) {
        item.item.forEach(fixItem);
    }
}

// Apply fixes to existing items
data.item.forEach(fixItem);

// 2. Add Missing Routes

// Donation
const donationFolder = {
    name: "Donation",
    item: [
        createRequest("Donation", "Create Donation", "POST", "donation/", {
            campaign: "General Fund",
            amount: "100.00",
            currency: "USD",
            transactionRef: "TX123456789"
        }),
        createRequest("Donation", "Get Donations", "GET", "donation/")
    ]
};
data.item.push(donationFolder);

// Info
const infoFolder = {
    name: "Info",
    item: [
        createRequest("Info", "Get Ministry Info", "GET", "info/")
    ]
};
data.item.push(infoFolder);

// Membership
const membershipFolder = {
    name: "Membership",
    item: [
        createRequest("Membership", "Register Membership", "POST", "membership/", {
            baptismInterest: false,
            communionAlert: true
        }),
        createRequest("Membership", "Get Memberships", "GET", "membership/")
    ]
};
data.item.push(membershipFolder);

// Profile
const profileFolder = {
    name: "Profile",
    item: [
        createRequest("Profile", "Get Profile", "GET", "profile/"),
        createRequest("Profile", "Update Profile", "PUT", "profile/", {
            displayName: "John Doe",
            bio: "A faithful member.",
            location: "New York, USA",
            phone_number: "+1234567890",
            birthdate: "1990-01-01"
        })
    ]
};
data.item.push(profileFolder);

// 3. Write back
fs.writeFileSync(postmanFile, JSON.stringify(data, null, 2));
console.log("Postman collection updated successfully.");
